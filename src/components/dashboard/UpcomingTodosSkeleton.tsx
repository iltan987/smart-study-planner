import { ListChecks } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

export function UpcomingTodosSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Upcoming Todos</CardTitle>
        <ListChecks className="h-6 w-6 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-3 pt-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center space-x-3 p-2 rounded-md border border-transparent"
          >
            <Skeleton className="h-5 w-5 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
        <Skeleton className="h-8 w-full mt-2 rounded-md" />
      </CardContent>
    </Card>
  );
}
