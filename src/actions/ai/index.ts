'use server';

import { RESPONSE_MESSAGES } from '@/constants/response-messages';
import { getGeminiModel } from '@/lib/gemini';
import {
  type CreateFunctionCallContentSchema,
  type CreateFunctionResponseContentSchema,
  createUserTextContentSchema,
  type CreateUserTextContentSchema,
  modelTextContentSchema,
} from '@/schemas/history.schema';
import { ContentType } from '@/types/content-type.type';
import type { Response } from '@/types/response.type';
import { getMemory } from '@/utils/memory.util';
import { saveTextHistory } from '@/utils/redis.util';
import type {
  ChatSession,
  FunctionCall,
  FunctionResponse,
  GenerateContentResult,
} from '@google/generative-ai';
import { FunctionCallingMode } from '@google/generative-ai';
import { Role } from '@prisma/client';
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
  message: CreateUserTextContentSchema
) => Promise<Response<CreateUserTextContentSchema, string>>;

export const sendMessage: SendMessageFunction = async (session, message) => {
  const userId = session.user.id;
  const userName = session.user.name;

  const parsedMessage = createUserTextContentSchema.safeParse(message);

  if (!parsedMessage.success) {
    return {
      success: false,
      error: parsedMessage.error.flatten(),
    };
  }

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
  const saveTextMessagePromise = saveTextHistory(
    session.user.id,
    parsedMessage.data
  );

  const chat = getGeminiModel().startChat({
    systemInstruction: {
      role: 'system',
      parts: [
        {
          text: `You are a helpful AI assistant designed to help students.
If user ask something not related to school, class, academic life say that you can't help with that. Only respond to specific topics. Be friendly and helpful.
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

User: 'I'm located in New York.'
You: (Calls saveUserInfo with content='Located in New York.')

User: 'My favorite color is blue.'
You: (Calls saveUserInfo with content='Favorite color is blue.')

User: 'I'm a software engineer.'
You: (Calls saveUserInfo with content='Is a Software engineer.')

User: 'I am studying computer science.'
You: (Calls saveUserInfo with content='Is studying computer science.')

User: 'My birthday is on January 1st.'
You: (Calls saveUserInfo with content='Birthday is on January 1st.')

User: 'Speak to me in x language.'
You: (Calls saveUserInfo with content='Prefers to be spoken to in x language.')

All memory entries should be stored in English. Avoid using relative data like 'today', 'now', or 'this week' in the memory content. Instead, use specific dates and times.
If the user provides information that is not relevant to their profile, you should ignore it and not save it.

User memory: ${JSON.stringify(userMemoryContents)}`,
        },
      ],
    },
    history: chatHistory.map((msg) => ({
      role: (msg.type === ContentType.TEXT
        ? msg.role
        : msg.type === ContentType.FUNCTION_CALL
          ? Role.MODEL
          : Role.FUNCTION
      ).toLowerCase(),
      parts: [
        msg.type === ContentType.TEXT
          ? {
              text: msg.text,
            }
          : msg.type === ContentType.FUNCTION_CALL
            ? {
                functionCall: {
                  name: msg.name,
                  args: msg.args,
                },
              }
            : {
                functionResponse: {
                  name: msg.name,
                  response: msg.response,
                },
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

  const response = await chat.sendMessage(parsedMessage.data.text);

  const result = await executeResponse(chat, response.response, userId);

  const modelResponse = {
    text: result.text(),
    time: new Date(),
  };

  // Wait for both save operations to complete
  await Promise.all([
    saveTextMessagePromise,
    saveTextMessage(modelTextContentSchema.parse(modelResponse)),
  ]);

  return {
    success: true,
    message: RESPONSE_MESSAGES.MESSAGE_SENT_SUCCESS,
    data: modelResponse.text,
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
  let resp: FunctionResponse = {
    name: funcCall.name,
    response: {},
  };

  let saveFunctionCallPromise = Promise.resolve();

  if (funcCall.name === saveUserInfo.name) {
    saveFunctionCallPromise = saveFunctionCall(funcCall);

    resp = await saveUserInfo(funcCall, userId);
  }

  await Promise.all([saveFunctionCallPromise, saveFunctionResponse(resp)]);

  return resp;
};

const saveFunctionCall = async (funcCall: FunctionCall) => {
  const functionCall: CreateFunctionCallContentSchema = {
    name: funcCall.name,
    args: funcCall.args,
  };

  await saveFunctionCallMessage(functionCall);
};

const saveFunctionResponse = async (funcResponse: FunctionResponse) => {
  const functionResponse: CreateFunctionResponseContentSchema = {
    name: funcResponse.name,
    response: funcResponse.response,
  };

  await saveFunctionResponseMessage(functionResponse);
};
