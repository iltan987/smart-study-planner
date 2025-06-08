import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import SettingsPageContent from './SettingsPageContent';

export default async function SettingsPage() {
  const session = await auth();
  if (!session) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      name: true,
      UserProfile: {
        select: {
          id: true,
          birthDate: true,
          gender: true,
          languages: true,
          nationality: true,
          EducationInfo: {
            select: {
              id: true,
              degree: true,
              endDate: true,
              fieldOfStudy: true,
              institution: true,
              startDate: true,
              cgpa: true,
              gradingSystem: true,
            },
            orderBy: { startDate: 'desc' },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return (
    <SettingsPageContent
      initialUserData={user}
      initialSessionData={session.user}
    />
  );
}
