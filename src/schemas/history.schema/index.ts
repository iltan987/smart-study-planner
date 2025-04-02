import { z } from 'zod';
import { functionCallContentSchema } from './functionCall';
import { functionResponseContentSchema } from './functionResponse';
import { textContentSchema } from './text';

/*
  From the UI:
    - A user can send a message:
      * Message structure:
        - role: user
        - type: text
        - text: string
    - The model can send a message:
      * Message structure:
        - role: model
        - type: text
        - time: Date
        - text: string
  
  From the API:
    - The AI can initiate a function call:
      * Message structure:
        - role: model
        - type: function_call
        - time: Date
        - name: string
        - args: {
            [key: string]: any
          }
    - A function can respond to an AI-initiated function call:
      * Message structure:
        - role: model
        - type: function_response
        - time: Date
        - name: string
        - response: {
            [key: string]: any
          }
    - From API to UI:
      * A return message from AI
      * Message structure:
        - role: model
        - type: text
        - time: Date
        - text: string
*/

export * from './functionCall';
export * from './functionResponse';
export * from './text';

export const historySchema = z.union([
  ...textContentSchema.options,
  functionCallContentSchema,
  functionResponseContentSchema,
]);

export type HistorySchema = z.infer<typeof historySchema>;
