'use server';

import { getSession } from './session.action';
import type { User } from '@prisma/client';
import type { Response } from '@/types/response';
import { RESPONSE_MESSAGES } from '@/utils/response_messages';
import { getUserById, updateUserById } from '@/utils/user.util';

type getUserFunction = () => Promise<Response<unknown, Omit<User, 'password'>>>;

export const getUser: getUserFunction = async () => {
  try {
    const session = await getSession();
    if (!session.success) {
      return {
        success: false,
        error: session.error,
      };
    }

    const user = await getUserById(session.data.id, {
      omit: { password: true },
    });

    if (!user) {
      return {
        success: false,
        error: RESPONSE_MESSAGES.USER_NOT_FOUND,
      };
    }

    return {
      success: true,
      message: RESPONSE_MESSAGES.USER_SUCCESS,
      data: user,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
    };
  }
};

type updateUserFunction = (
  data: Omit<User, 'id' | 'password'>
) => Promise<Response<unknown>>;

export const updateUser: updateUserFunction = async (data) => {
  try {
    const session = await getSession();
    if (!session.success) {
      return {
        success: false,
        error: session.error,
      };
    }

    await updateUserById(session.data.id, data, {
      select: {},
    });

    return {
      success: true,
      message: RESPONSE_MESSAGES.UPDATE_SUCCESS,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
    };
  }
};
