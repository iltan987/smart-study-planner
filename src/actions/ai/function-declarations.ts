import { SchemaType, type FunctionDeclaration } from '@google/generative-ai';
import { saveUserInfo } from './function-implementations';

export const functionDeclarations: FunctionDeclaration[] | undefined = [
  {
    name: saveUserInfo.name,
    description: 'Saves important information about the user to the database',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        content: {
          type: SchemaType.STRING,
          description: 'The valuable information provided by the user',
        },
      },
      required: ['content'],
    },
  },
];
