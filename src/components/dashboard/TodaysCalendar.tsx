'use client';

import { getCalendarEvents } from '@/actions/calendar.action';
import type { CalendarEvent } from '@prisma/client';
import { endOfDay, startOfDay } from 'date-fns';
import { CalendarDays, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { DashboardCalendarItem } from './DashboardCalendarItem';
import { TodaysCalendarSkeleton } from './TodaysCalendarSkeleton';

export function TodaysCalendar() {
  const [todaysCalendarEvents, setTodaysCalendarEvents] = useState<
    CalendarEvent[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTodaysCalendarEvents() {
      const today = new Date();

      const response = await getCalendarEvents({
        start: startOfDay(today),
        end: endOfDay(today),
      });
      if (response.success) {
        setTodaysCalendarEvents(response.data);
      }
      setLoading(false);
    }
    fetchTodaysCalendarEvents();
  }, []);

  if (loading) {
    return <TodaysCalendarSkeleton />;
  }

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">
          Today&apos;s Calendar
        </CardTitle>
        <CalendarDays className="h-6 w-6 text-primary" />
      </CardHeader>
      <CardContent>
        {todaysCalendarEvents.length > 0 ? (
          <div className="space-y-2">
            {todaysCalendarEvents.map((event) => (
              <DashboardCalendarItem key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Your calendar is clear for today!
          </p>
        )}
        <Button asChild variant="outline" className="w-full mt-4">
          <Link href="/calendar">
            <PlusCircle className="mr-2 h-4 w-4" /> Add or View Calendar
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
