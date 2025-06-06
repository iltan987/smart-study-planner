import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cn } from '@/lib/utils';
import {
  avatarBackgroundColors,
  avatarTextColors,
  defaultAvatarTextColor,
  getInitials,
} from '@/utils/avatar.util';
import { Gender } from '@prisma/client';
import { format } from 'date-fns';
import {
  CalendarIcon,
  GlobeIcon,
  GraduationCapIcon,
  UserCircle,
} from 'lucide-react';
import { redirect } from 'next/navigation';

const GenderMapping = {
  [Gender.MALE]: 'Male',
  [Gender.FEMALE]: 'Female',
  [Gender.OTHER]: 'Other',
  [Gender.PREFER_NOT_TO_SAY]: 'Prefer not to say',
};

export default async function ProfilePage() {
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
          birthDate: true,
          gender: true,
          languages: true,
          nationality: true,
          EducationInfo: {
            select: {
              degree: true,
              endDate: true,
              fieldOfStudy: true,
              institution: true,
              startDate: true,
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

  // Calculate avatar properties
  const initials = getInitials(user.name);
  const charCodeSum = user.name
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const selectedBgColor =
    avatarBackgroundColors[charCodeSum % avatarBackgroundColors.length] ||
    'bg-gray-200';
  const selectedTextColor =
    avatarTextColors[selectedBgColor] || defaultAvatarTextColor;

  return (
    <div className="container mx-auto py-8 max-w-4xl md:py-6">
      <div className="grid gap-6">
        {/* Profile Card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your basic profile information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-start gap-6">
              <Avatar className="h-28 w-28 rounded-lg">
                <AvatarFallback
                  className={cn(
                    'rounded-lg text-2xl',
                    selectedBgColor,
                    selectedTextColor
                  )}
                  aria-label={`Avatar for ${user.name}`}
                  role="img"
                >
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-4 flex-1">
                <div>
                  <h3 className="text-xl font-semibold">{user.name}</h3>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <UserCircle
                        className="h-4 w-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <span className="text-sm font-medium">Gender:</span>
                      <span className="text-sm">
                        {user.UserProfile?.gender
                          ? GenderMapping[user.UserProfile.gender]
                          : 'Not specified'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <GlobeIcon
                        className="h-4 w-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <span className="text-sm font-medium">Nationality:</span>
                      <span className="text-sm">
                        {user.UserProfile?.nationality || 'Not specified'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <CalendarIcon
                        className="h-4 w-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <span className="text-sm font-medium">Birth Date:</span>
                      <span className="text-sm">
                        {user.UserProfile?.birthDate
                          ? format(user.UserProfile.birthDate, 'PPP')
                          : 'Not specified'}
                      </span>
                    </div>
                  </div>
                </div>

                {user.UserProfile?.languages &&
                  user.UserProfile.languages.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Languages</h4>
                      <div className="flex flex-wrap gap-2">
                        {user.UserProfile.languages.map((language, index) => (
                          <Badge key={index} variant="secondary">
                            {language}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Education Card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Education</CardTitle>
            <CardDescription>Your educational background</CardDescription>
          </CardHeader>
          <CardContent>
            {user.UserProfile?.EducationInfo &&
            user.UserProfile.EducationInfo.length > 0 ? (
              <div className="space-y-6">
                {user.UserProfile.EducationInfo.map((education, index) => (
                  <div key={index}>
                    {index > 0 && <Separator className="my-4" />}
                    <div className="flex items-start gap-4">
                      <div className="rounded-md bg-primary/10 p-2">
                        <GraduationCapIcon
                          className="h-5 w-5 text-primary"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="space-y-1 flex-1">
                        <h4 className="text-base font-medium">
                          {education.institution || 'Unknown Institution'}
                        </h4>
                        <div className="text-sm">
                          <span className="font-medium">
                            {education.degree}
                          </span>
                          {education.fieldOfStudy && (
                            <span> in {education.fieldOfStudy}</span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {education.startDate &&
                            format(education.startDate, 'MMM yyyy')}{' '}
                          -
                          {education.endDate
                            ? format(education.endDate, ' MMM yyyy')
                            : ' Present'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <GraduationCapIcon
                  className="h-12 w-12 mx-auto mb-3 opacity-20"
                  aria-hidden="true"
                />
                <p>No education information available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
