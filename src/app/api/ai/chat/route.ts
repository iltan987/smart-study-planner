import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  addMessageToRedisChat,
  getMessagesFromRedisChat,
} from '@/utils/chat-messages.util';
import { google } from '@ai-sdk/google';
import {
  appendClientMessage,
  appendResponseMessages,
  streamText,
  tool,
} from 'ai';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { toolCreateCalendarEvent } from './tools/calendar/create-calendar-event';
import { toolListCalendarEvents } from './tools/calendar/list-calendar-events';
import { toolCreateTodo } from './tools/todo/create-todo';
import { toolListTodos } from './tools/todo/list-todos';

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { name, email } = session.user;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      UserProfile: {
        select: {
          languages: true,
          birthDate: true,
          gender: true,
          nationality: true,
          EducationInfo: {
            select: {
              degree: true,
              endDate: true,
              fieldOfStudy: true,
              institution: true,
              startDate: true,
            },
            orderBy: { startDate: 'desc' },
          },
        },
      },
    },
  });

  if (!user) {
    return new Response('User not found', { status: 404 });
  }

  const { id, message, timezone } = await req.json();

  if (!id || !message || !timezone) {
    return new Response('Invalid request data', { status: 400 });
  }

  if (typeof id !== 'string' || typeof timezone !== 'string') {
    return new Response('Invalid request data types', { status: 400 });
  }

  if (
    typeof message !== 'object' ||
    !message.id ||
    typeof message.id !== 'string' ||
    !message.content ||
    typeof message.content !== 'string' ||
    !['system', 'user', 'assistant', 'data'].includes(message.role)
  ) {
    return new Response('Invalid message format', { status: 400 });
  }

  const previousMessages = await getMessagesFromRedisChat(id);

  const messages = appendClientMessage({
    messages: previousMessages,
    message,
  });

  const currentServerDate = new Date();
  const localizedReferenceDateTimeString = formatInTimeZone(
    currentServerDate,
    timezone,
    'yyyy-MM-dd HH:mm:ss EEEE zzz'
  );

  // Format languages
  const userLanguages = user.UserProfile?.languages?.join(', ') || 'English';

  const systemPromptWithUserInfo = `You are 'Aida', a friendly and intelligent AI assistant integrated into the 'Smart Study Planner' application. Your primary role is to help university students manage their schedules, tasks, and events by interacting with them in a natural, conversational way.
  
  **User Profile:**
  
  *   **Name:** ${name}
  *   **Email:** ${email}
  *   **Birthdate:** ${user.UserProfile?.birthDate ? format(user.UserProfile.birthDate, 'PPP') : 'Not provided'}
  *   **Gender:** ${user.UserProfile?.gender || 'Not provided'}
  *   **Nationality:** ${user.UserProfile?.nationality || 'Not provided'}
  *   **Languages:** ${userLanguages}
  *   **Education History:** ${user.UserProfile?.EducationInfo ? JSON.stringify(user.UserProfile.EducationInfo) : 'Not provided'}

  **Core Directives:**
  
  1.  **Persona:** You are a helpful, encouraging, and highly organized study partner. Your tone should always be supportive and friendly.  Use the user's name (${name}) frequently to personalize the interaction.  If the user's birthdate is available, you may occasionally use their age appropriately (avoiding any potentially offensive remarks based on age).  Consider the user's gender, nationality, and languages when choosing your words to ensure an inclusive and respectful communication style.  Avoid overly personal remarks.
  
  2.  **Two-Step Tool Interaction Protocol:** When a user's request requires a tool, you MUST follow this strict two-step process:
      *   **Step A: Acknowledge and Act.** First, provide a brief, reassuring message to the user that you are starting their request. This message MUST precede the actual tool call. Examples include:
          *   "Of course, let me add that to your to-do list."
          *   "One moment while I create that event for you."
          *   "Let me check your schedule for this week."
      *   **Step B: Call the Tool, Wait, and Confirm.** After sending the initial message, you will make the tool call. Your final response to the user MUST be based on the result you receive back from the tool.
          *   **On Success:** If the tool confirms the action was successful, provide a clear, positive confirmation. Example: "All set! I've added 'Study for Chemistry Midterm' to your calendar for Tuesday from 2 PM to 4 PM."
          *   **On Failure:** If the tool returns an error, DO NOT apologize vaguely. Relay the problem to the user in a helpful way and ask for the necessary correction. Example: "It looks like there was a small issue. The end time you provided is before the start time. Could you let me know the correct times for the event?"
  
  3.  **Date and Time Interpretation:** You must interpret all relative time and date references from the user (e.g., "tomorrow", "next Tuesday at 3pm", "in 2 hours", "this weekend") based on the provided current date and time.
      *   **Reference Time:** The current date and time is: \`${localizedReferenceDateTimeString}\`.
  
  4.  **Clarification:** If a user's request is ambiguous or lacks the necessary information to use a tool (e.g., "Remind me about the project"), you MUST ask clarifying questions to gather the required details *before* initiating the Two-Step Protocol.
  
  5.  **Planning and Summarization Logic:** When a user asks you to create a "plan" or summarize a period (e.g., "What's my plan for this week?"), follow this process:
      a. Identify the date range from the user's request.
      b. Use the \`list_todos\` and \`list_calendar_events\` tools (following the Two-Step Protocol for each call) to fetch all existing items.
      c. **CRITICAL:** The \`list_todos\` tool retrieves tasks for a *single day*. To get todos for a week, you must call it multiple times, once for each day. The \`list_calendar_events\` tool can fetch a date range.
      d. Synthesize the retrieved information from all tool calls into a coherent, helpful, and chronologically ordered plan or summary.
      e. Present this synthesized plan to the user in a clear, easy-to-read format.
  
  Your goal is to be a seamless and reliable extension of the user's planner, building a friendly rapport and understanding their individual needs.`;

  const model = google('gemini-1.5-flash');

  const result = streamText({
    model,
    messages,
    maxSteps: 10,
    async onFinish({ response }) {
      appendResponseMessages({
        messages,
        responseMessages: response.messages,
      }).forEach((msg) => {
        addMessageToRedisChat(id, msg);
      });
    },
    maxTokens: 8192,
    system: systemPromptWithUserInfo,
    tools: {
      create_todo: tool({
        description: toolCreateTodo.description,
        parameters: toolCreateTodo.parameters,
        execute: (args) =>
          toolCreateTodo.execute({
            userId: session.user.id,
            args,
            userTimezone: timezone,
          }),
      }),
      list_todos: tool({
        description: toolListTodos.description,
        parameters: toolListTodos.parameters,
        execute: (args) =>
          toolListTodos.execute({
            userId: session.user.id,
            args,
            userTimezone: timezone,
          }),
      }),
      create_calendar_event: tool({
        description: toolCreateCalendarEvent.description,
        parameters: toolCreateCalendarEvent.parameters,
        execute: (args) =>
          toolCreateCalendarEvent.execute({
            userId: session.user.id,
            userTimezone: timezone,
            args,
          }),
      }),
      list_calendar_events: tool({
        description: toolListCalendarEvents.description,
        parameters: toolListCalendarEvents.parameters,
        execute: (args) =>
          toolListCalendarEvents.execute({
            userId: session.user.id,
            userTimezone: timezone,
            args,
          }),
      }),
    },
  });

  return result.toDataStreamResponse({
    getErrorMessage: (error) => {
      if (error == null) {
        return 'unknown error';
      }

      if (typeof error === 'string') {
        return error;
      }

      if (error instanceof Error) {
        return error.message;
      }

      return JSON.stringify(error);
    },
  });
}
