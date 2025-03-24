'use server';

import { RESPONSE_MESSAGES } from '@/constants/response-messages';
import { getGeminiModel } from '@/lib/gemini';
import {
  type FunctionCallContentOnlyHistorySchema,
  textContentOnlyHistorySchema,
  type TextContentOnlyHistorySchema,
} from '@/schemas/history.schema';
import type { Response } from '@/types/response.type';
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

  const history = await getFullHistory();
  if (!history.success) {
    return {
      success: false,
      error: history.error,
    };
  }
  const chatHistory = history.data;

  const userProfile = await getUserProfile();
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

  saveTextMessage(textMessage);

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

User profile: ${JSON.stringify({ ...userData, ...userProfileData, education: educationWithoutId })}`,
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

  saveTextMessage(modelResponse);
  return {
    success: true,
    message: RESPONSE_MESSAGES.MESSAGE_SENT_SUCCESS,
    data: modelResponse.content.textContent.text,
  };
};

const executeResponse = async (
  chat: ChatSession,
  response: GenerateContentResult['response'],
  userId: string
) => {
  const functionCalls = response.functionCalls();

  if (!functionCalls) {
    return response;
  }

  const funcResponses = await Promise.all(
    functionCalls.map((funcCall) => makeFunctionCall(funcCall, userId))
  );

  const newResponse = await chat.sendMessage(
    funcResponses.map((functionResponse) => ({
      functionResponse,
    }))
  );

  return await executeResponse(chat, newResponse.response, userId);
};

const makeFunctionCall = async (
  funcCall: FunctionCall,
  userId: string
): Promise<FunctionResponse> => {
  if (funcCall.name === saveUserInfo.name) {
    saveFunctionCall(funcCall);
    return saveUserInfo(funcCall, userId);
  }
  throw new Error('Function not found');
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
