import { CalendarDays } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

export function TodaysCalendarSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">
          Today&apos;s Calendar
        </CardTitle>
        <CalendarDays className="h-6 w-6 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-3 pt-2">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="flex items-start space-x-3 p-2 rounded-md border border-transparent"
          >
            <Skeleton className="h-4 w-16" /> {/* Time */}
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-full" /> {/* Title */}
            </div>
          </div>
        ))}
        <Skeleton className="h-8 w-full mt-2 rounded-md" />
      </CardContent>
    </Card>
  );
}
