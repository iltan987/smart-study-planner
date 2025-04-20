'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { UserProfileSchema } from '@/schemas/user-profile.schema';
import { Calendar, Mail, User } from 'lucide-react';

const UserProfilePageDataContent: React.FC<{
  userProfile: UserProfileSchema;
}> = ({ userProfile }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <Card className="rounded-2xl shadow-xl">
        <CardHeader className="flex items-center gap-4">
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-muted text-muted-foreground">
            <User className="w-8 h-8" />
          </div>
          <div>
            <CardTitle className="text-2xl font-semibold">
              {userProfile.name}
            </CardTitle>
            <p className="text-muted-foreground text-sm">User Profile</p>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="text-muted-foreground w-5 h-5" />
            <span>{userProfile.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="text-muted-foreground w-5 h-5" />
            <span>{userProfile.profile.dob?.toString() ?? 'no dob'}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfilePageDataContent;
