'use server';

import { RESPONSE_MESSAGES } from '@/constants/response-messages';
import { getGeminiModel } from '@/lib/gemini';
import {
  type FunctionCallContentOnlyHistorySchema,
  type FunctionResponseContentOnlyHistorySchema,
  textContentOnlyHistorySchema,
  type TextContentOnlyHistorySchema,
} from '@/schemas/history.schema';
import type { Response } from '@/types/response.type';
import { getMemory } from '@/utils/memory.util';
import type {
  ChatSession,
  FunctionCall,
  FunctionResponse,
  GenerateContentResult,
} from '@google/generative-ai';
import { FunctionCallingMode } from '@google/generative-ai';
import { ContentType } from '@prisma/client';
import type { Session } from 'next-auth';
import {
  getFullHistory,
  saveFunctionCallMessage,
  saveFunctionResponseMessage,
  saveTextMessage,
} from '../history.action';
import { getUserProfile } from '../user-profile.action';
import { functionDeclarations } from './function-declarations';
import { saveUserInfo } from './function-implementations';

type SendMessageFunction = (
  session: Session,
  message: TextContentOnlyHistorySchema
) => Promise<Response<TextContentOnlyHistorySchema, string>>;

export const sendMessage: SendMessageFunction = async (session, message) => {
  const userId = session.user.id;
  const userName = session.user.name;

  const parsedMessage = textContentOnlyHistorySchema.safeParse(message);

  if (!parsedMessage.success) {
    return {
      success: false,
      error: parsedMessage.error.flatten(),
    };
  }

  if (parsedMessage.data.content.type !== ContentType.TEXT) {
    return {
      success: false,
      error: RESPONSE_MESSAGES.INVALID_MESSAGE_TYPE,
    };
  }

  const textMessage: TextContentOnlyHistorySchema = {
    ...parsedMessage.data,
    content: parsedMessage.data.content,
  };

  // Run `getFullHistory`, `getUserProfile` and `getMemory` in parallel
  const [history, userProfile, memory] = await Promise.all([
    getFullHistory(),
    getUserProfile(),
    getMemory(userId),
  ]);

  if (!history.success) {
    return {
      success: false,
      error: history.error,
    };
  }
  const chatHistory = history.data;

  if (!userProfile.success) {
    return {
      success: false,
      error: userProfile.error,
    };
  }
  const {
    image: _,
    profile: { education, ...userProfileData },
    ...userData
  } = userProfile.data;

  const educationWithoutId = education.map(({ id: _, ...rest }) => rest);

  if (!memory.success) {
    return {
      success: false,
      error: memory.error.flatten(),
    };
  }
  const { data: userMemory } = memory;

  const userMemoryContents = userMemory.map((f) => f.content);

  // Save the text message independently
  const saveTextMessagePromise = saveTextMessage(textMessage);

  const chat = getGeminiModel().startChat({
    systemInstruction: {
      role: 'system',
      parts: [
        {
          text: `You are an AI assistant designed to help students.
If user ask something not related to school, class, academic life say that you can't help with that. Only respond to specific topics.
Their name is "${userName}".
Today is ${new Date().toLocaleDateString()}.
Current time is ${new Date().toLocaleTimeString()}.
Given date is in timezone GMT${new Date().getTimezoneOffset() > 0 ? '-' : '+'}${Math.abs(new Date().getTimezoneOffset() / 60)}.
Analyze user text style using the chat history and try to respond accordingly.

User profile: ${JSON.stringify({ ...userData, ...userProfileData, education: educationWithoutId })}

When a user provides information that could be useful for future interactions, you should save it to the user's profile using the 'saveUserInfo' function.
Examples of valuable information include:
* Their current work or projects.
* Their job title or role.
* Their preferred name or how they like to be addressed.
* Their interests or hobbies.
* Their location.
* Any information that they explicitly state they would like you to remember.

If you identify valuable information, extract the relevant content, and call the 'saveUserInfo' function with the extracted content.

Example:

User: 'I'm currently working on a new project related to AI.'
You: (Calls saveUserInfo with content='Currently working on a new project related to AI.')

User: 'Please call me Alex.'
You: (Calls saveUserInfo with content='Prefers to be called Alex.')

User: 'I love playing tennis.'
You: (Calls saveUserInfo with content='Loves playing tennis.')

All memory entries should be stored in English.

User memory: ${JSON.stringify(userMemoryContents)}`,
        },
      ],
    },
    history: chatHistory.map((msg) => ({
      role: msg.role.toLowerCase(),
      parts: [
        msg.content.type === ContentType.TEXT
          ? {
              text: msg.content.textContent.text,
            }
          : msg.content.type === ContentType.FUNCTION_CALL
            ? {
                functionCall: msg.content.functionCallContent,
              }
            : {
                functionResponse: msg.content.functionResponseContent,
              },
      ],
    })),
    tools: [
      {
        functionDeclarations,
      },
    ],
    toolConfig: { functionCallingConfig: { mode: FunctionCallingMode.AUTO } },
  });

  const response = await chat.sendMessage(
    parsedMessage.data.content.textContent.text
  );

  const result = await executeResponse(chat, response.response, userId);

  const modelResponse: TextContentOnlyHistorySchema = {
    content: {
      type: ContentType.TEXT,
      textContent: {
        text: result.text(),
      },
    },
    role: 'MODEL',
    time: new Date(),
  };

  // Wait for both save operations to complete
  await Promise.all([saveTextMessagePromise, saveTextMessage(modelResponse)]);

  return {
    success: true,
    message: RESPONSE_MESSAGES.MESSAGE_SENT_SUCCESS,
    data: modelResponse.content.textContent.text,
  };
};

const executeResponse = async (
  chat: ChatSession,
  initialResponse: GenerateContentResult['response'],
  userId: string
) => {
  let currentResponse = initialResponse;

  while (true) {
    const functionCalls = currentResponse.functionCalls();

    if (!functionCalls || functionCalls.length === 0) {
      break;
    }

    const funcResponses = await Promise.all(
      functionCalls.map((funcCall) => makeFunctionCall(funcCall, userId))
    );

    currentResponse = await chat
      .sendMessage(
        funcResponses
          .filter((resp) => resp !== undefined)
          .map((functionResponse) => ({
            functionResponse,
          }))
      )
      .then((response) => response.response);
  }

  return currentResponse;
};

const makeFunctionCall = async (
  funcCall: FunctionCall,
  userId: string
): Promise<FunctionResponse | undefined> => {
  let resp: FunctionResponse | undefined;
  if (funcCall.name === saveUserInfo.name) {
    saveFunctionCall(funcCall);
    resp = await saveUserInfo(funcCall, userId);
  }
  if (resp) {
    saveFunctionResponse(resp);
  }
  return resp;
};

const saveFunctionCall = async (funcCall: FunctionCall) => {
  const functionCall: FunctionCallContentOnlyHistorySchema = {
    content: {
      type: ContentType.FUNCTION_CALL,
      functionCallContent: funcCall,
    },
    role: 'MODEL',
    time: new Date(),
  };

  saveFunctionCallMessage(functionCall);
};

const saveFunctionResponse = async (funcResponse: FunctionResponse) => {
  const functionResponse: FunctionResponseContentOnlyHistorySchema = {
    content: {
      type: ContentType.FUNCTION_RESPONSE,
      functionResponseContent: funcResponse,
    },
    role: 'MODEL',
    time: new Date(),
  };

  saveFunctionResponseMessage(functionResponse);
};
