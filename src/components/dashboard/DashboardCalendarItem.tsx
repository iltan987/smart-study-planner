import { Skeleton } from '@/components/ui/skeleton';
import type { CalendarEvent } from '@prisma/client';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';

export function DashboardCalendarItem({
  event,
}: {
  event: Pick<CalendarEvent, 'end' | 'start' | 'title'>;
}) {
  const [clientDisplayStartTime, setClientDisplayStartTime] = useState<
    string | null
  >(null);
  const [clientDisplayTimeRange, setClientDisplayTimeRange] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (event.start && event.end) {
      setClientDisplayStartTime(format(event.start, 'ha'));
      setClientDisplayTimeRange(
        `${format(event.start, 'p')} - ${format(event.end, 'p')}`
      );
    }
  }, [event.start, event.end]);

  return (
    <div className="flex items-start gap-3 p-3 hover:bg-muted/50 rounded-md transition-colors">
      <div className="flex flex-col items-center pt-0.5">
        {clientDisplayStartTime === null ? (
          <Skeleton className="h-4 w-[40px]" />
        ) : (
          <p className="text-xs font-semibold">{clientDisplayStartTime}</p>
        )}
      </div>
      <div className="flex-1 border-l-2 border-primary pl-3">
        <p className="text-sm font-medium leading-tight group-hover:underline">
          {event.title}
        </p>
        {clientDisplayTimeRange === null ? (
          <Skeleton className="h-4 w-[120px] mt-0.5" />
        ) : (
          <p className="text-xs text-muted-foreground">
            {clientDisplayTimeRange}
          </p>
        )}
      </div>
    </div>
  );
}
