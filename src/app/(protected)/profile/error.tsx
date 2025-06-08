'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function ProfileError({ error }: { error: Error }) {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card className="mt-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-6 w-6" aria-hidden="true" />
            Error Loading Profile
          </CardTitle>
          <CardDescription>
            We couldn&apos;t load your profile information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive font-medium" role="alert">
            {error.message || 'User not found or an unexpected error occurred.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
