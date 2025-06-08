'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { UserProfileInput } from '@/schemas/settings.schema';
import { userProfileSchema } from '@/schemas/settings.schema';
import type { YearMonthDate } from '@/schemas/time.schema';
import type { Result } from '@/types/response';

function yearMonthDateToDate(
  yearMonthDate: YearMonthDate | undefined | null
): Date | null {
  if (!yearMonthDate) return null;
  return new Date(
    Date.UTC(yearMonthDate.year, yearMonthDate.monthIndex, yearMonthDate.date)
  );
}

export async function updateUserProfileAndEducation(
  input: UserProfileInput
): Promise<Result<undefined, UserProfileInput>> {
  const session = await auth();
  if (!session?.user.id) {
    return { success: false, error: 'Unauthorized' };
  }
  const userId = session.user.id;

  // 1. Validate input on the server side
  const validationResult = userProfileSchema.safeParse(input);
  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.flatten(),
    };
  }

  const { name, birthDate, gender, nationality, languages, educationHistory } =
    validationResult.data;

  try {
    await prisma.$transaction(async (tx) => {
      // update user name
      await tx.user.update({
        where: { id: userId },
        data: { name },
      });

      // find or Create UserProfile
      let userProfile = await tx.userProfile.findUnique({
        where: { userId },
        include: { EducationInfo: true }, // include existing education info for comparison
      });

      if (!userProfile) {
        userProfile = await tx.userProfile.create({
          data: {
            userId,
            birthDate: yearMonthDateToDate(birthDate),
            gender: gender,
            nationality: nationality,
            languages: languages || [],
          },
          include: { EducationInfo: true },
        });
      } else {
        await tx.userProfile.update({
          where: { userId },
          data: {
            birthDate: yearMonthDateToDate(birthDate),
            gender: gender,
            nationality: nationality,
            languages: languages || [],
          },
        });
      }

      // handle CRUD for EducationInfo
      const existingEducationIds = userProfile.EducationInfo.map(
        (edu) => edu.id
      );
      const submittedEducationIds = educationHistory
        .map((edu) => edu.id)
        .filter((id): id is string => !!id); // filter undefined IDs (new items)

      // delete education records not in submitted list
      const idsToDelete = existingEducationIds.filter(
        (id) => !submittedEducationIds.includes(id)
      );
      if (idsToDelete.length > 0) {
        await tx.educationInfo.deleteMany({
          where: {
            id: { in: idsToDelete },
            userProfileId: userProfile.id, // ensure ownership
          },
        });
      }

      // update existing or create new education records
      for (const eduItem of educationHistory) {
        const educationData = {
          institution: eduItem.institution,
          degree: eduItem.degree,
          fieldOfStudy: eduItem.fieldOfStudy,
          startDate: eduItem.startDate,
          endDate: eduItem.endDate || null,
          cgpa: eduItem.cgpa || null,
          gradingSystem: eduItem.gradingSystem || null,
          userProfileId: userProfile.id,
        };

        if (eduItem.id && existingEducationIds.includes(eduItem.id)) {
          // update existing
          await tx.educationInfo.update({
            where: { id: eduItem.id },
            data: educationData,
          });
        } else {
          // create new
          await tx.educationInfo.create({
            data: educationData,
          });
        }
      }
    });

    return { success: true, message: 'Profile updated successfully.' };
  } catch (error) {
    console.error('Error updating user profile and education:', error);
    // Check for specific Prisma errors if needed, e.g., unique constraint violations
    return {
      success: false,
      error: 'An unexpected error occurred while updating the profile.',
    };
  }
}
