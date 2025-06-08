import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsPageLoading() {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-lg" />
          <div>
            <Skeleton className="h-7 w-48 mb-1" />
            <Skeleton className="h-5 w-64" />
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-6">
        <div className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto sm:h-10 gap-1.5">
          <Skeleton className="h-full w-full rounded-md" />
          <Skeleton className="h-full w-full rounded-md" />
          <Skeleton className="h-full w-full rounded-md" />
        </div>

        {/* Profile Tab Content Skeleton (default visible) */}
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-3/5 mb-2" />
            <Skeleton className="h-5 w-4/5" />
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Separator />
            <Skeleton className="h-6 w-1/3 mb-4" />
            {/* Date of Birth */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
            {/* Gender */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-20" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 flex-grow" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
            {/* Nationality */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-10 w-full" />
            </div>
            {/* Languages Spoken */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-[40px] w-full rounded-md" />{' '}
              {/* Badge area */}
              <div className="flex items-center gap-2 mt-2">
                <Skeleton className="h-10 flex-grow" />
                <Skeleton className="h-9 w-20" /> {/* Add button */}
              </div>
              <Skeleton className="h-4 w-3/4 mt-1" /> {/* Description */}
            </div>
          </CardContent>
        </Card>

        {/* Placeholder for other tab contents if needed, or just show one active tab skeleton */}
      </div>

      {/* Save Button Skeleton */}
      <div className="mt-8 flex justify-end">
        <Skeleton className="h-12 w-48" />
      </div>
    </div>
  );
}
