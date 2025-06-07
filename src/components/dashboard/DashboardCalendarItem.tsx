import type { CalendarEvent } from '@prisma/client';
import { format } from 'date-fns';

export function DashboardCalendarItem({ event }: { event: CalendarEvent }) {
  return (
    <div className="flex items-start gap-3 p-3 hover:bg-muted/50 rounded-md transition-colors">
      <div className="flex flex-col items-center pt-0.5">
        <p className="text-xs font-semibold">{format(event.start, 'ha')}</p>
      </div>
      <div className="flex-1 border-l-2 border-primary pl-3">
        <p className="text-sm font-medium leading-tight group-hover:underline">
          {event.title}
        </p>
        <p className="text-xs text-muted-foreground">
          {format(event.start, 'p')} - {format(event.end, 'p')}
        </p>
      </div>
    </div>
  );
}
