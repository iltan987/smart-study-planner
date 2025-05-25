import type { HoursMinutes, YearMonthDate } from '@/schemas/time.schema';
import { endOfDay, set, startOfDay } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';

export function localToUtc(
  date: YearMonthDate,
  timezone: string,
  time?: HoursMinutes | null
): Date {
  let localDate = new Date(date.year, date.month - 1, date.date);

  if (time) {
    localDate = set(localDate, {
      hours: time.hours,
      minutes: time.minutes,
      seconds: 0,
      milliseconds: 0,
    });
  } else {
    // Default to the start of the day if no time is provided
    localDate = startOfDay(localDate);
  }

  try {
    return fromZonedTime(localDate, timezone);
  } catch (error) {
    console.error('Error converting local to UTC:', error);
    throw new Error(
      `Invalid timezone or date/time combination: ${timezone}, ${date.year}-${date.month}-${date.date} ${
        time ? `${time.hours}:${time.minutes}` : ''
      }`
    );
  }
}

export function getUtcDateRangeForLocalDay(
  date: YearMonthDate,
  timezone: string
): { utcStart: Date; utcEnd: Date } {
  const localDate = new Date(date.year, date.month - 1, date.date);

  try {
    const localStartOfDay = startOfDay(localDate);
    const localEndOfDay = endOfDay(localDate);

    const utcStart = fromZonedTime(localStartOfDay, timezone);
    const utcEnd = fromZonedTime(localEndOfDay, timezone);

    return { utcStart, utcEnd };
  } catch (error) {
    console.error('Error getting UTC date range:', error);
    throw new Error(
      `Invalid timezone or date combination: ${timezone}, ${date.year}-${date.month}-${date.date}`
    );
  }
}
