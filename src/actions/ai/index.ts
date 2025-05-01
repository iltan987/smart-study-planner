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
  message: UserTextSchema
) => Promise<Response<TextContentSchema, { text: string; timeSent: Date }>>;

export const sendMessage: SendMessageFunction = async (session, message) => {
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
Current date and time: ${new Date().toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}

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
- Always convert dates and times to user-friendly formats (e.g., "tomorrow at 3 PM" instead of ISO format)
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
Common optional parameters: description, category (study/assignment/exam/work/gym/other), priority (low/medium/high), dueTime (ISO format)

Important: You can create todos with any dueTime - past, present, or future dates are all acceptable. This is useful for:
- Recording completed tasks retroactively
- Tracking missed deadlines
- Planning future activities

Examples:
- User: "Remind me to study calculus tomorrow at 3pm."
  Action: Call createTodo(title='Study calculus', category='study', dueTime='[TOMORROW]T15:00:00Z')
- User: "Need to finish my essay by Friday night, it's super important!"
  Action: Call createTodo(title='Finish essay', category='assignment', priority='high', dueTime='[FRIDAY]T20:00:00Z')
- User: "I had a chemistry lab yesterday that I need to write up."
  Action: Call createTodo(title='Write up chemistry lab', category='assignment', dueTime='[YESTERDAY]T18:00:00Z')
- User: "I missed my study group meeting last Monday at 5pm."
  Action: Call createTodo(title='Study group meeting', category='study', dueTime='[LAST_MONDAY]T17:00:00Z', status='missed')

## Retrieving Todos
Use 'getTodos' function to fetch the user's todos within a specific date range.
Required parameters: start (ISO date), end (ISO date)

Examples:
- User: "What tasks do I have this week?"
  Action: Call getTodos(start='[MONDAY_THIS_WEEK]T00:00:00Z', end='[SUNDAY_THIS_WEEK]T23:59:59Z')
- User: "Show me my todos for tomorrow."
  Action: Call getTodos(start='[TOMORROW]T00:00:00Z', end='[TOMORROW]T23:59:59Z')
- User: "What assignments do I have due next month?"
  Action: Call getTodos(start='[FIRST_DAY_NEXT_MONTH]T00:00:00Z', end='[LAST_DAY_NEXT_MONTH]T23:59:59Z')
- User: "What tasks did I miss last week?"
  Action: Call getTodos(start='[MONDAY_LAST_WEEK]T00:00:00Z', end='[SUNDAY_LAST_WEEK]T23:59:59Z')

## Updating Todos
Use 'markTodoAs' function with these statuses: pending, completed, missed

IMPORTANT: The markTodoAs function requires a todoId. NEVER ask the user for this ID. Instead, obtain it through one of these methods:

1. For recently created todos:
   - When createTodo is called, it returns a response with {status: 'success', todoId: 'some-id'}
   - Store this todoId in your conversation context
   - Use this todoId when the user refers to the todo they just created

2. For existing todos:
   - First call getTodos with an appropriate date range to retrieve todos
   - Find the matching todo in the returned list based on the user's description
   - Extract the todoId from the matching todo
   - Then call markTodoAs with this todoId

Process examples:

Example 1 (Recently created todo):
- User: "Create a task to study for my chemistry exam tomorrow"
- You call: createTodo(title='Study for chemistry exam', dueTime='[TOMORROW]T18:00:00Z')
- Function returns: {status: 'success', todoId: 'abc123'}
- User then says: "I actually finished that already"
- You call: markTodoAs(todoId='abc123', status='completed')

Example 2 (Existing todo):
- User: "I finished my math homework from yesterday"
- First call: getTodos(start='[YESTERDAY]T00:00:00Z', end='[TODAY]T00:00:00Z')
- This returns: [{id: 'xyz789', title: 'Math homework', ...}, {...}]
- Then call: markTodoAs(todoId='xyz789', status='completed')

Example 3 (Todo described by user):
- User: "Mark my physics lab report as completed"
- First call: getTodos(start='[LAST_WEEK]T00:00:00Z', end='[NEXT_WEEK]T23:59:59Z') // wide date range to find relevant todos
- Find todo with title containing "physics lab report" in results
- Then call: markTodoAs(todoId='found-id', status='completed')

Important: When referring to dates and times in your responses, ALWAYS use natural, conversational formats (e.g., "Friday afternoon" or "next Monday at 2 PM") instead of technical formats.`.trim(),
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

  const result = await executeResponse(chat, response.response, userId);

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
  } else if (funcCall.name === createTodo.name) {
    saveFunctionCall(funcCall);
    resp = await createTodo(funcCall, userId);
  } else if (funcCall.name === markTodoAs.name) {
    saveFunctionCall(funcCall);
    resp = await markTodoAs(funcCall, userId);
  } else if (funcCall.name === getTodos.name) {
    saveFunctionCall(funcCall);
    resp = await getTodos(funcCall, userId);
  }
  if (resp) {
    saveFunctionResponse(resp);
  }
  return resp;
};

const saveFunctionCall = async (funcCall: FunctionCall) => {
  const functionCall: FunctionCallContentSchema = {
    type: ContentType.function_call,
    ...funcCall,
  };

  saveFunctionCallMessage(functionCall);
};

const saveFunctionResponse = async (funcResponse: FunctionResponse) => {
  const functionResponse: FunctionResponseContentSchema = {
    type: ContentType.function_response,
    ...funcResponse,
  };

  saveFunctionResponseMessage(functionResponse);
};
