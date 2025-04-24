import prisma from '@/lib/db';
import {
  memorySchema,
  updateMemorySchema,
  type UpdateMemorySchema,
} from '@/schemas/memory.schema';
import 'server-only';

export async function getMemory(userId: string) {
  const memories = await prisma.memory.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
    },
  });

  return memorySchema.array().safeParse(memories);
}

export async function createMemory(userId: string, data: UpdateMemorySchema) {
  const parsedData = updateMemorySchema.safeParse(data);
  if (!parsedData.success) {
    return {
      success: false,
      error: parsedData.error.flatten(),
    };
  }
  const { content } = parsedData.data;
  const memory = await prisma.memory.create({
    data: {
      userId,
      content,
    },
    select: {
      id: true,
    },
  });

  return memory.id;
}
