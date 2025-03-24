import prisma from '@/lib/db';
import { memorySchema } from '@/schemas/memory.schema';
import type { FunctionCall } from '@google/generative-ai';

export const saveUserInfo = async (funcCall: FunctionCall, userId: string) => {
  const parsedArgs = memorySchema.safeParse(funcCall.args);
  if (parsedArgs.success) {
    await prisma.memory.create({
      data: {
        userId: userId,
        content: parsedArgs.data.content,
      },
    });

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
