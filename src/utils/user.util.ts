import type { Prisma } from '@/generated/prisma-client';
import prisma from '@/lib/db';

type UserFindUniqueOptions = Omit<Prisma.UserFindUniqueArgs, 'where'>;
type UserUpdateOptions = Omit<Prisma.UserUpdateArgs, 'where' | 'data'>;
type UserDeleteOptions = Omit<Prisma.UserDeleteArgs, 'where'>;

export async function createUser<T extends Prisma.UserCreateArgs>(
  options: Prisma.SelectSubset<T, Prisma.UserCreateArgs>
) {
  return prisma.user.create(options);
}

export async function getUserById<T extends UserFindUniqueOptions>(
  id: string,
  options?: Prisma.SelectSubset<T, UserFindUniqueOptions>
) {
  return prisma.user.findUnique({
    where: { id },
    ...(options as object),
  });
}

export async function getUserByEmail<T extends UserFindUniqueOptions>(
  email: string,
  options?: Prisma.SelectSubset<T, UserFindUniqueOptions>
) {
  return prisma.user.findUnique({
    where: { email },
    ...(options as object),
  });
}

export async function updateUserById<T extends UserUpdateOptions>(
  id: string,
  data: Prisma.XOR<Prisma.UserUpdateInput, Prisma.UserUncheckedUpdateInput>,
  options?: Prisma.SelectSubset<T, UserUpdateOptions>
) {
  return prisma.user.update({ where: { id }, data, ...(options as object) });
}

export async function updateUserByEmail<T extends UserUpdateOptions>(
  email: string,
  data: Prisma.XOR<Prisma.UserUpdateInput, Prisma.UserUncheckedUpdateInput>,
  options?: Prisma.SelectSubset<T, UserUpdateOptions>
) {
  return prisma.user.update({ where: { email }, data, ...(options as object) });
}

export async function deleteUserById<T extends UserDeleteOptions>(
  id: string,
  options?: Prisma.SelectSubset<T, UserDeleteOptions>
) {
  return prisma.user.delete({ where: { id }, ...(options as object) });
}

export async function deleteUserByEmail<T extends UserDeleteOptions>(
  email: string,
  options?: Prisma.SelectSubset<T, UserDeleteOptions>
) {
  return prisma.user.delete({ where: { email }, ...(options as object) });
}
