'use server';

import { RESPONSE_MESSAGES } from '@/constants/response-messages';
import { ContentType, TextContentRole } from '@/generated/prisma-client';
import { getGeminiModel } from '@/lib/gemini';
import type {
  FunctionCallContentSchema,
  FunctionResponseContentSchema,
  ModelTextSchema,
  TextContentSchema,
  UserTextSchema,
} from '@/schemas/history.schema';
import { userTextSchema } from '@/schemas/history.schema';
import type { Response } from '@/types/response.type';
import { getMemory } from '@/utils/memory.util';
import type {
  ChatSession,
  FunctionCall,
  FunctionResponse,
  GenerateContentResult,
} from '@google/generative-ai';
import { FunctionCallingMode } from '@google/generative-ai';
import type { Session } from 'next-auth';
import {
  getFullHistory,
  saveFunctionCallMessage,
  saveFunctionResponseMessage,
  saveTextMessage,
} from '../history.action';
import { getUserProfile } from '../user-profile.action';
import { functionDeclarations } from './function-declarations';
import {
  createTodo,
  getTodos,
  markTodoAs,
  saveUserInfo,
} from './function-implementations';

type SendMessageFunction = (
  session: Session,
  message: UserTextSchema,
  userDate: Date,
  userTimeZone: string
) => Promise<Response<TextContentSchema, { text: string; timeSent: Date }>>;

export const sendMessage: SendMessageFunction = async (
  session,
  message,
  userDateTime,
  userTimeZone
) => {
  const userId = session.user.id;
  const userName = session.user.name;

  const parsedMessage = userTextSchema.safeParse(message);

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
  const saveTextMessagePromise = saveTextMessage(parsedMessage.data);

  const chat = getGeminiModel().startChat({
    systemInstruction: {
      role: 'system',
      parts: [
        {
          text: `# ASSISTANT ROLE
You are StudyBot, an AI assistant specialized in helping students with academic matters.
Their name is "${userName}" and you should address them by this name occasionally.
Current SERVER date and time: ${new Date().toISOString()}

# BOUNDARIES
- ONLY respond to queries related to: academics, studying, time management, school life, education planning, and learning strategies.
- For non-academic topics, politely explain you're designed specifically to help with educational matters.
- Do not provide assistance with: cheating, plagiarism, unethical behavior, or any harmful activities.

# USER CONTEXT
User profile: ${JSON.stringify({ ...userData, ...userProfileData, education: educationWithoutId })}
Previous memory entries: ${JSON.stringify(userMemoryContents)}

# RESPONSE STYLE
- Match the user's communication style (formal/casual, brief/detailed)
- Use clear, conversational language - avoid technical jargon unless necessary
- **IMPORTANT: When providing dates and times to the user in your textual responses, ALWAYS use natural, user-friendly formats (e.g., "tomorrow at 3 PM", "next Friday afternoon").**
- When discussing deadlines or time-related concepts, add helpful context (e.g., "That's in 3 days" or "You have 48 hours remaining")
- Structure complex answers with headings and bullet points for readability
- Use analogies and examples to explain difficult concepts
- Respond as if you're a helpful friend, not a formal system

# MEMORY MANAGEMENT
Save important user information using the 'saveUserInfo' function, such as:
- Academic goals, course information, projects
- Learning preferences or study habits
- Important dates and deadlines
- Personal preferences related to academics

Examples:
- User: "I'm majoring in Computer Science with a minor in Business."
  Action: Call saveUserInfo(content='Majoring in Computer Science with minor in Business')
- User: "I prefer visual learning materials over text."
  Action: Call saveUserInfo(content='Prefers visual learning materials')

All memory entries should be stored in English.

# TODO MANAGEMENT
## Creating Todos
Use 'createTodo' function when users mention tasks they need to complete.
Required parameter: title
Common optional parameters: description, category (study/assignment/exam/work/gym/other), priority (low/medium/high), dueTime.

For the dueTime, extract the user's time expression and convert it into a proper structure:
dueTime: {
  duration_to_add: {
    years?: number,
    months?: number,
    weeks?: number,
    days?: number,
    hours?: number,
    minutes?: number,
    seconds?: number,
  },
  duration_to_set: {
    year?: number,
    month?: number,
    date?: number,
    hours?: number,
    minutes?: number,
    seconds?: number,
  },
}
- The server will provide the user's current date/time and timezone.
- Only fill in the relevant fields for add and/or set based on the user's input.
- If the user specifies an exact time (e.g., "at 3 P.M."), use only set (e.g., set: { hours: 15, minutes: 0 }).
- If the user specifies a relative time (e.g., "in 2 hours"), use only add (e.g., add: { hours: 2 }).
- If both are needed (e.g., "tomorrow at 3 P.M."), use both (e.g., add: { days: 1 }, set: { hours: 15, minutes: 0 }).
- Do NOT perform or expect the calculation or resulting date/time yourself.

Examples:
- "Remind me to study calculus at 3 P.M.":
  dueTime: { duration_to_set: { hours: 15, minutes: 0 } }
- "Remind me to study calculus in 2 hours":
  dueTime: { duration_to_add: { hours: 2 } }
- "Remind me to study calculus tomorrow at 3 P.M.":
  dueTime: { duration_to_add: { days: 1 }, duration_to_set: { hours: 15, minutes: 0 } }

When providing dates and times in your responses, ALWAYS use natural, conversational formats (e.g., "Friday afternoon" or "next Monday at 2 PM") instead of technical formats.`.trim(),
        },
      ],
    },
    history: chatHistory.map((msg) => ({
      role:
        msg.type === ContentType.text
          ? msg.role
          : msg.type === ContentType.function_call
            ? 'model'
            : 'function',
      parts: [
        msg.type === ContentType.text
          ? {
              text: msg.text,
            }
          : msg.type === ContentType.function_call
            ? {
                functionCall: { name: msg.name, args: msg.args },
              }
            : {
                functionResponse: { name: msg.name, response: msg.response },
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

  const result = await executeResponse(chat, response.response, {
    userId,
    userDateTime,
    userTimeZone,
  });

  const modelResponse: ModelTextSchema = {
    role: TextContentRole.model,
    type: ContentType.text,
    text: result.text(),
    timeSent: new Date(),
  };

  // Wait for both save operations to complete
  await Promise.all([saveTextMessagePromise, saveTextMessage(modelResponse)]);

  return {
    success: true,
    message: RESPONSE_MESSAGES.MESSAGE_SENT_SUCCESS,
    data: { text: modelResponse.text, timeSent: modelResponse.timeSent },
  };
};

const executeResponse = async (
  chat: ChatSession,
  initialResponse: GenerateContentResult['response'],
  {
    userId,
    userDateTime,
    userTimeZone,
  }: {
    userId: string;
    userDateTime: Date;
    userTimeZone: string;
  }
) => {
  let currentResponse = initialResponse;

  while (true) {
    const functionCalls = currentResponse.functionCalls();

    if (!functionCalls || functionCalls.length === 0) {
      break;
    }

    const funcResponses = await Promise.all(
      functionCalls.map((funcCall) =>
        makeFunctionCall(funcCall, {
          userId,
          userDateTime,
          userTimeZone,
        })
      )
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
  context: {
    userId: string;
    userDateTime: Date;
    userTimeZone: string;
  }
): Promise<FunctionResponse | undefined> => {
  let resp: FunctionResponse | undefined;
  if (funcCall.name === saveUserInfo.name) {
    saveFunctionCall(funcCall, context);
    resp = {
      name: saveUserInfo.name,
      response: (await saveUserInfo(funcCall, context)) as object,
    };
  } else if (funcCall.name === createTodo.name) {
    saveFunctionCall(funcCall, context);
    resp = {
      name: createTodo.name,
      response: (await createTodo(funcCall, context)) as object,
    };
  } else if (funcCall.name === markTodoAs.name) {
    saveFunctionCall(funcCall, context);
    resp = {
      name: markTodoAs.name,
      response: (await markTodoAs(funcCall, context)) as object,
    };
  } else if (funcCall.name === getTodos.name) {
    saveFunctionCall(funcCall, context);
    resp = {
      name: getTodos.name,
      response: (await getTodos(funcCall, context)) as object,
    };
  }
  if (resp) {
    saveFunctionResponse(resp);
  }
  return resp;
};

const saveFunctionCall = async (
  funcCall: FunctionCall,
  context: {
    userId?: string;
    userDateTime?: Date;
    userTimeZone?: string;
  }
) => {
  const functionCall: FunctionCallContentSchema = {
    type: ContentType.function_call,
    ...funcCall,
  };

  saveFunctionCallMessage(functionCall, context);
};

const saveFunctionResponse = async (funcResponse: FunctionResponse) => {
  const functionResponse: FunctionResponseContentSchema = {
    type: ContentType.function_response,
    ...funcResponse,
  };

  saveFunctionResponseMessage(functionResponse);
};
