'use server';

import { messageSchema, type MessageSchema } from '@/schemas/message.schema';
import type { Response } from '@/types/response.type';
import gemini from '@/lib/gemini';
import { getUserChatHistory, saveMessage } from './message.action';
import { RESPONSE_MESSAGES_SUCCESS } from '@/constants/response-messages';
import type { Session } from 'next-auth';
import type {
  Content,
  FunctionCall,
  FunctionResponse,
  GenerateContentResult,
  GenerativeModel,
} from '@google/generative-ai';
import { FunctionCallingMode, SchemaType } from '@google/generative-ai';
import { memorySchema } from '@/schemas/memory.schema';
import prisma from '@/lib/db';

type SendMessageFunction = (
  session: Session,
  message: MessageSchema
) => Promise<Response<MessageSchema, MessageSchema>>;

export const sendMessage: SendMessageFunction = async (session, message) => {
  const userId = session.user.id;
  const userName = session.user.name;

  const parsedMessage = messageSchema.safeParse(message);

  if (!parsedMessage.success) {
    return {
      success: false,
      error: parsedMessage.error.flatten(),
    };
  }

  const history = await getUserChatHistory(userId);

  saveMessage(userId, parsedMessage.data);

  const model = gemini.genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: `You are a helpful assistant. You are talking with a student.
    If user ask something not related to school, class, academic life say that you can't help with that. Only respond to specific topics.
    Their name is "${userName}".
    Today is ${new Date().toLocaleDateString()}.
    Current time is ${new Date().toLocaleTimeString()}.
    Timezone is GMT${new Date().getTimezoneOffset() > 0 ? '-' : '+'}${Math.abs(new Date().getTimezoneOffset() / 60)}.
    Analyze user text style using the chat history and try to respond accordingly.
    You have a long-term memory that you can use to remember important information about the user.
    Analyze user messages for personal preferences, facts, or any information that would be helpful to remember in the future.
    For example, if the user says "I like to play basketball" or "My favorite subject is math," this should be stored in memory.
    All memory entries should be stored in English.`,
    tools: [
      {
        functionDeclarations: [
          {
            name: 'update_memory',
            description:
              "This function adds new entries to the AI's long-term memory. It is invoked either when the user explicitly requests the AI to remember something or when the AI automatically determines that a piece of information should be retained by inferring from the user's message. Each string provided represents a separate memory entry that will be stored, extending the available context beyond the limited previous one day of chat history",
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                memories: {
                  type: SchemaType.ARRAY,
                  description:
                    'An array of one or more strings. Each string is a distinct piece of information to be remembered',
                  items: {
                    type: SchemaType.STRING,
                  },
                },
              },
              required: ['memories'],
            },
          },
          {
            name: 'retrieve_memory',
            description:
              'This function retrieves all previously stored memory entries that were saved using the update_memory function. It does not require any input parameters and returns the complete set of memories available for reference',
          },
        ],
      },
    ],
    toolConfig: { functionCallingConfig: { mode: FunctionCallingMode.AUTO } },
  });

  const initialContent: Content[] = history.map((msg) => ({
    role: msg.owner,
    parts: [{ text: msg.content }],
  }));

  initialContent.push({
    role: 'user',
    parts: [{ text: parsedMessage.data.content }],
  });

  const response = await model.generateContent({ contents: initialContent });

  const result = await executeResponse(
    model,
    response.response,
    userId,
    initialContent
  );

  const modelResponse: MessageSchema = {
    content: result.text(),
    time: new Date(),
    owner: 'model',
  };
  saveMessage(userId, modelResponse);
  return {
    success: true,
    message: RESPONSE_MESSAGES_SUCCESS.MESSAGE_SENT_SUCCESS,
    data: modelResponse,
  };
};

const executeResponse = async (
  model: GenerativeModel,
  response: GenerateContentResult['response'],
  userId: string,
  contents: Content[]
) => {
  const functionCalls = response.functionCalls();

  if (!functionCalls) {
    return response;
  }

  contents.push({
    role: 'model',
    parts: functionCalls.map((funcCall) => {
      return {
        functionCall: funcCall,
      };
    }),
  });

  const funcResponses = await Promise.all(
    functionCalls.map((funcCall) => makeFunctionCall(funcCall, userId))
  );

  contents.push({
    role: 'user',
    parts: funcResponses.map((funcResponse) => {
      return {
        functionResponse: funcResponse,
      };
    }),
  });

  const newResponse = await model.generateContent({ contents });

  return await executeResponse(model, newResponse.response, userId, contents);
};

const makeFunctionCall = async (
  funcCall: FunctionCall,
  userId: string
): Promise<FunctionResponse> => {
  if (funcCall.name === 'update_memory') {
    const parsedArgs = memorySchema.safeParse(funcCall.args);
    if (parsedArgs.success) {
      for (const memory of parsedArgs.data.memories) {
        await prisma.memory.create({
          data: {
            userId: userId,
            content: memory,
          },
        });

        return {
          name: 'update_memory',
          response: {
            status: 'success',
          },
        };
      }
    }
  } else if (funcCall.name === 'retrieve_memory') {
    const memories = await prisma.memory.findMany({
      where: { userId: userId },
      select: { content: true },
    });

    const memoryList = memories.map((memory) => memory.content);

    return {
      name: 'retrieve_memory',
      response: {
        status: 'success',
        memories: memoryList,
      },
    };
  }
  throw new Error('Function not found');
};
