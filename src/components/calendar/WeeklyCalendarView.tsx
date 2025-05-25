import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatUtcToLocalTime, isDateToday } from '@/utils/client-date.util';
import type { CalendarEvent } from '@prisma/client';
import {
  format as dateFnsFormat,
  eachDayOfInterval,
  isSameDay,
} from 'date-fns';
import { Edit3, PlusCircle, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type ClientCalendarEvent = CalendarEvent & {
  tempId?: string;
  _isAdding?: boolean;
  _isDeleting?: boolean;
  _isUpdating?: boolean;
};

interface WeeklyCalendarViewProps {
  weekStartDate?: Date;
  weekEndDate?: Date;
  isLoadingEvents: boolean;
  events: ClientCalendarEvent[];
  userTimezone: string;
  onEventEdit: (event: ClientCalendarEvent) => void;
  onEventDeleteInitiate: (eventId: string) => void;
  onCellClick: (date: Date) => void;
}

export function WeeklyCalendarView({
  weekStartDate,
  weekEndDate,
  isLoadingEvents,
  events,
  userTimezone,
  onEventEdit,
  onEventDeleteInitiate,
  onCellClick,
}: WeeklyCalendarViewProps) {
  const weekDays = useMemo(() => {
    return (
      weekStartDate &&
      weekEndDate &&
      eachDayOfInterval({
        start: weekStartDate,
        end: weekEndDate,
      })
    );
  }, [weekEndDate, weekStartDate]);

  const [random7Numbers, setRandom7Numbers] = useState<number[]>();
  useEffect(() => {
    setRandom7Numbers(
      Array.from({ length: 7 }, () => Math.floor(Math.random() * 4))
    );
  }, []);

  return (
    <div className="grid grid-cols-7 border-t border-l border-border min-w-[700px] md:min-w-[840px] lg:min-w-full">
      {!weekDays
        ? Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className={`relative p-2 border-b border-r border-border min-h-[120px]`}
            >
              <div className="flex justify-between items-center mb-1">
                <Skeleton className="h-3 w-8 sm:h-3.5" />
                <Skeleton className="h-5 w-8 sm:h-6" />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="w-full h-auto p-0.5 my-1 text-xs justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 flex items-center"
                disabled
              >
                <PlusCircle className="h-3 w-3 mr-1" />
                Add
              </Button>

              {(random7Numbers?.[i] ?? 0) > 0 && isLoadingEvents && (
                <div className="mt-1 space-y-1 text-xs">
                  {Array.from({ length: random7Numbers?.[i] ?? 0 }, (_, i) => (
                    <Skeleton key={i} className="h-13 w-full rounded-md" />
                  ))}
                </div>
              )}
            </div>
          ))
        : weekDays.map((day, i) => (
            <div
              key={i}
              className={`relative p-2 border-b border-r border-border min-h-[120px]
                ${isDateToday(day) ? 'bg-accent/30' : ''}`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-xs sm:text-sm">
                  {dateFnsFormat(day, 'EEE')}
                </span>
                <span
                  className={`text-xl sm:text-2xl font-light ${
                    isDateToday(day)
                      ? 'text-primary font-medium'
                      : 'text-muted-foreground'
                  }`}
                >
                  {dateFnsFormat(day, 'd')}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="w-full h-auto p-0.5 my-1 text-xs justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 flex items-center"
                onClick={() => day && onCellClick(day)}
                disabled={!day || isLoadingEvents}
              >
                <PlusCircle className="h-3 w-3 mr-1" /> Add
              </Button>

              <div className="mt-1 space-y-1 text-xs">
                {isLoadingEvents && random7Numbers?.[i]
                  ? Array.from({ length: random7Numbers[i] }, (_, i) => (
                      <Skeleton key={i} className="h-13 w-full rounded-md" />
                    ))
                  : events
                      .filter(
                        (event) =>
                          isSameDay(event.startTime, day) ||
                          (event.startTime < day && event.endTime > day)
                      )
                      .sort(
                        (a, b) => a.startTime.getTime() - b.startTime.getTime()
                      )
                      .map((event) => (
                        <div
                          key={event.id}
                          className={`p-1 rounded border text-[10px] leading-tight cursor-pointer hover:shadow-md transition-all
                              ${
                                event._isAdding
                                  ? 'opacity-60 bg-blue-50 border-blue-200 animate-pulse'
                                  : 'bg-blue-100 border-blue-300 text-blue-800'
                              }
                              ${
                                event._isDeleting
                                  ? 'opacity-50 bg-red-50 border-red-200 line-through animate-pulse'
                                  : ''
                              }
                              dark:bg-blue-800/70 dark:border-blue-700 dark:text-blue-100
                              dark:${event._isAdding ? 'bg-blue-900/70' : ''}
                              dark:${event._isDeleting ? 'bg-red-900/70' : ''}`}
                          onClick={() =>
                            !event._isAdding &&
                            !event._isUpdating &&
                            !event._isDeleting &&
                            onEventEdit(event)
                          }
                        >
                          <p className="font-semibold truncate">
                            {event.title}
                          </p>
                          <p>
                            {formatUtcToLocalTime(
                              event.startTime,
                              userTimezone
                            )}{' '}
                            -{' '}
                            {formatUtcToLocalTime(event.endTime, userTimezone)}
                          </p>
                          {(event._isAdding ||
                            event._isUpdating ||
                            event._isDeleting) && (
                            <p className="text-[9px] italic">
                              {event._isAdding
                                ? 'Saving...'
                                : event._isDeleting
                                  ? 'Deleting...'
                                  : 'Processing...'}
                            </p>
                          )}
                          {!event._isAdding &&
                            !event._isUpdating &&
                            !event._isDeleting && (
                              <div className="flex gap-1 mt-0.5">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-4 w-4 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEventEdit(event);
                                  }}
                                >
                                  <Edit3 className="h-2.5 w-2.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-4 w-4 p-0 hover:bg-destructive/20 hover:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEventDeleteInitiate(event.id);
                                  }}
                                >
                                  <Trash2 className="h-2.5 w-2.5" />
                                </Button>
                              </div>
                            )}
                        </div>
                      ))}
              </div>
            </div>
          ))}
    </div>
  );
}
