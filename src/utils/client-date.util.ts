import type { FormatOptions } from 'date-fns';
import {
  format as formatDateFns,
  isToday as isTodayFns,
  parseISO,
  startOfWeek as startOfWeekFns,
} from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export function formatUtcToLocalTime(
  utcDateInput: string | Date | null | undefined,
  timezone: string,
  locale?: string
): string {
  if (!utcDateInput || !timezone) return '';

  const utcDate =
    typeof utcDateInput === 'string' ? parseISO(utcDateInput) : utcDateInput;
  const targetLocale =
    locale || (typeof navigator !== 'undefined' ? navigator.language : 'en-US');

  try {
    const zonedDate = toZonedTime(utcDate, timezone);

    return new Intl.DateTimeFormat(targetLocale, {
      hour: 'numeric',
      minute: 'numeric',
    }).format(zonedDate);
  } catch (error) {
    console.error(
      'Error formatting UTC to Local Time with locale:',
      targetLocale,
      error
    );
    try {
      return formatDateFns(toZonedTime(utcDate, timezone), 'p');
    } catch (fallbackError) {
      console.error('Fallback formatting error:', fallbackError);
      return 'Invalid time';
    }
  }
}

export function formatToYYYYMMDD(date: Date): string {
  return formatDateFns(date, 'yyyy-MM-dd');
}

export function formatToReadableDate(
  date: Date,
  locale?: FormatOptions['locale']
): string {
  try {
    return formatDateFns(date, 'MMMM d, yyyy', { locale });
  } catch (error) {
    console.error('Error formatting to readable date:', error);
    return formatDateFns(date, 'MM/dd/yyyy'); // Fallback
  }
}

export function getStartOfWeekMonday(date: Date): Date {
  return startOfWeekFns(date, { weekStartsOn: 1 }); // 1 means Monday
}

export function isDateToday(date: Date): boolean {
  return isTodayFns(date);
}
