import {
  addMessageToRedisChat,
  getMessagesFromRedisChat,
} from '@/utils/chat-messages.util';
import { google } from '@ai-sdk/google';
import { appendClientMessage, appendResponseMessages, streamText } from 'ai';

export const maxDuration = 60;

export async function POST(req: Request) {
  const { id, message, timezone: _ } = await req.json();

  const previousMessages = await getMessagesFromRedisChat(id);

  const messages = appendClientMessage({
    messages: previousMessages,
    message,
  });

  const result = streamText({
    model: google('models/gemini-2.0-flash-001', {
      useSearchGrounding: true,
      dynamicRetrievalConfig: {
        mode: 'MODE_DYNAMIC',
      },
    }),
    messages,
    maxSteps: 5,
    async onFinish({ response }) {
      appendResponseMessages({
        messages,
        responseMessages: response.messages,
      }).forEach((msg) => {
        addMessageToRedisChat(id, msg);
      });
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
    sendSources: true,
  });
}
