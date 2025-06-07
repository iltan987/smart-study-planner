import { Card, CardContent, CardHeader } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

export function HeaderSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-3/5 rounded-md" />
        <Skeleton className="h-5 w-4/5 mt-2 rounded-md" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full rounded-md" />
      </CardContent>
    </Card>
  );
}
