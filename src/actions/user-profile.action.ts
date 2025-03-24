'use server';

import { RESPONSE_MESSAGES } from '@/constants/response-messages';
import prisma from '@/lib/db';
import {
  updateUserProfileSchema,
  type UpdateUserProfileSchema,
  userProfileSchema,
  type UserProfileSchema,
} from '@/schemas/user-profile.schema';
import type { Response } from '@/types/response.type';
import { hashPassword } from '@/utils/crypto.util';
import { withAuth } from '@/utils/withAuth';

type GetProfileFunction = () => Promise<Response<undefined, UserProfileSchema>>;

export const getUserProfile: GetProfileFunction = async () =>
  await withAuth(async (session) => {
    if (!session) {
      return { success: false, error: RESPONSE_MESSAGES.UNAUTHORIZED };
    }

    const userProfile = await prisma.user.findUnique({
      where: { id: session.user.id },
      omit: {
        id: true,
        password: true,
      },
      include: {
        profile: {
          omit: {
            userId: true,
          },
          include: {
            education: {
              omit: {
                profileUserId: true,
              },
            },
          },
        },
      },
    });

    if (!userProfile) {
      return { success: false, error: RESPONSE_MESSAGES.USER_NOT_FOUND };
    }

    return {
      success: true,
      message: RESPONSE_MESSAGES.PROFILE_RETRIEVED_SUCCESS,
      data: userProfileSchema.parse(userProfile),
    };
  });

type UpdateProfileFunction = (
  data: UpdateUserProfileSchema
) => Promise<Response<UpdateUserProfileSchema, UserProfileSchema>>;

export const updateUserProfile: UpdateProfileFunction = async (data) =>
  await withAuth(async (session) => {
    if (!session) {
      return { success: false, error: RESPONSE_MESSAGES.UNAUTHORIZED };
    }

    const parsedData = updateUserProfileSchema.safeParse(data);

    if (!parsedData.success) {
      return { success: false, error: parsedData.error.flatten() };
    }

    const { profile, ...userData } = parsedData.data;

    if (userData.password && userData.currentPassword) {
      const res = await prisma.user.findUnique({
        where: {
          id: session.user.id,
          password: await hashPassword(userData.currentPassword),
        },
        select: {
          id: true,
        },
      });
      if (!res) {
        return { success: false, error: RESPONSE_MESSAGES.INVALID_PASSWORD };
      }
      userData.password = await hashPassword(userData.password);
    }

    const omitInclude = {
      omit: {
        id: true,
        password: true,
      },
      include: {
        profile: {
          omit: {
            userId: true,
          },
          include: {
            education: {
              omit: {
                profileUserId: true,
              },
            },
          },
        },
      },
    };

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...userData,
        profile: profile
          ? (() => {
              const { education, ...profileData } = profile;
              return {
                update: {
                  ...profileData,
                  education:
                    education && education.length > 0
                      ? {
                          deleteMany: {},
                          create: education.map((edu) => ({
                            ...edu,
                            profileUserId: session.user.id,
                          })),
                        }
                      : undefined,
                },
              };
            })()
          : undefined,
      },
      ...omitInclude,
    });

    return {
      success: true,
      message: RESPONSE_MESSAGES.PROFILE_UPDATE_SUCCESS,
      data: userProfileSchema.parse(updated),
    };
  });

export const emailAvailable = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { email: true },
  });
  return !user;
};
