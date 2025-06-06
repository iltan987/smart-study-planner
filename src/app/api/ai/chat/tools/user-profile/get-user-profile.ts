import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';

export const toolGetUserProfileDetails = {
  description: 'Retrieves detailed profile information for the current user.',
  execute: async ({ userId }: { userId: string }): Promise<string> => {
    console.log(`TOOL CALL: get_user_profile_details for user ${userId}`);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        UserProfile: {
          select: {
            birthDate: true,
            gender: true,
            nationality: true,
            languages: true,
            EducationInfo: {
              select: {
                degree: true,
                endDate: true,
                fieldOfStudy: true,
                institution: true,
                startDate: true,
              },
              orderBy: { startDate: 'desc' },
              take: 3,
            },
          },
        },
      },
    });
    if (!user) return "I couldn't find the user profile details.";

    let summary = `Current User: ${user.name}. Email: ${user.email}.`;
    if (user.UserProfile) {
      if (user.UserProfile.birthDate)
        summary += ` DOB: ${format(user.UserProfile.birthDate, 'PPP')}.`;
      if (user.UserProfile.gender)
        summary += ` Gender: ${user.UserProfile.gender}.`;
      if (user.UserProfile.nationality)
        summary += ` Nationality: ${user.UserProfile.nationality}.`;
      if (user.UserProfile.languages?.length)
        summary += ` Languages: ${user.UserProfile.languages.join(', ')}.`;
      if (user.UserProfile.EducationInfo?.length) {
        summary += ` Recent Education: ${user.UserProfile.EducationInfo.map((e) => `${e.degree} at ${e.institution}`).join('; ')}.`;
      }
    }
    return summary;
  },
};
