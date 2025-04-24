import { updateMemorySchema } from '@/schemas/memory.schema';
import type { FunctionCall } from '@google/generative-ai';
import { createMemory } from '../../utils/memory.util';

export const saveUserInfo = async (funcCall: FunctionCall, userId: string) => {
  const parsedArgs = updateMemorySchema.safeParse(funcCall.args);
  if (parsedArgs.success) {
    await createMemory(userId, parsedArgs.data);

    return {
      name: saveUserInfo.name,
      response: {
        status: 'success',
      },
    };
  }
  return {
    name: saveUserInfo.name,
    response: {
      status: 'error',
    },
  };
};
