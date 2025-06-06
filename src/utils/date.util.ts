import type { AiDateTimeInput } from '@/schemas/ai-tools.schema'; // Adjust path as per your project structure
import type { DateValues } from 'date-fns';
import { add, isValid, set, startOfDay } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';

/**
 * Represents the outcome of processing the AI's date/time input.
 * - `finalDateUTC`: The calculated date/time as a JavaScript Date object, normalized to UTC.
 *                   This is typically what you'd store in a database with Prisma.
 * - `userLocalTime`: The calculated date/time as a JavaScript Date object, representing the exact
 *                    moment in the user's specified local timezone. Useful for confirmations.
 * - `isAllDay`: Boolean indicating if the processed date/time represents an all-day event or task
 *               (i.e., no specific time components like hours, minutes, or seconds were set by the AI,
 *               or they were explicitly set to the beginning of the day like 00:00:00).
 */
export interface ProcessedAiDate {
  finalDateUTC: Date;
  userLocalTime: Date;
  isAllDay: boolean;
}

/**
 * Processes the AI's structured date/time input (AiDateTimeInput with 'add' and/or 'set' properties)
 * relative to a current reference date and taking into account the user's specified IANA timezone.
 *
 * The AI is expected to provide month numbers as 1 (January) to 12 (December) in the 'set.months' field.
 * This function handles the conversion to 0-indexed months required by JavaScript Date objects and date-fns.
 *
 * @param aiDateTimeInput The AiDateTimeInput object from the AI. Can be undefined or null.
 * @param userTimezone The IANA timezone string for the user (e.g., "America/New_York", "Europe/London").
 * @param referenceDateUTC The current server time or a specific reference point, as a JavaScript Date object (assumed to be in UTC or a consistent server timezone that toZonedTime can correctly interpret as a universal moment).
 * @returns A ProcessedAiDate object if the input is valid and processed successfully, otherwise null.
 */
export function processAiDateTimeInput(
  aiDateTimeInput: AiDateTimeInput | undefined | null,
  userTimezone: string,
  referenceDateUTC: Date
): ProcessedAiDate | null {
  if (!isValid(referenceDateUTC)) {
    console.error(
      '[processAiDateTimeInput] Invalid referenceDateUTC provided.'
    );
    return null;
  }
  if (!userTimezone || typeof userTimezone !== 'string') {
    console.error('[processAiDateTimeInput] Invalid userTimezone provided.');
    return null;
  }
  try {
    Intl.DateTimeFormat(undefined, { timeZone: userTimezone });
  } catch (e) {
    console.error(
      `[processAiDateTimeInput] Invalid IANA timezone string: ${userTimezone}`,
      e
    );
    return null; // Invalid timezone string
  }

  if (!aiDateTimeInput || (!aiDateTimeInput.add && !aiDateTimeInput.set)) {
    // No valid 'add' or 'set' operations provided by the AI.
    // Depending on requirements, you might return current time or null.
    // For tool usage, null is safer to indicate AI didn't specify a date.
    return null;
  }

  // 1. Establish the reference point in the user's local timezone.
  // `referenceDateUTC` is a specific moment in time. `toZonedTime` converts this moment
  // to a Date object whose local getters (getFullYear, getMonth, getDate, getHours etc.)
  // will reflect that moment in the `userTimezone`.
  let workingUserLocalTime = toZonedTime(referenceDateUTC, userTimezone);

  // 2. Apply relative 'add' adjustments.
  // These operations are performed on the `workingUserLocalTime` which is already in the user's timezone context.
  if (aiDateTimeInput.add) {
    // Create a duration object, defaulting undefined fields to 0 for date-fns/add
    const addDuration = {
      years: aiDateTimeInput.add.years || 0,
      months: aiDateTimeInput.add.months || 0,
      weeks: aiDateTimeInput.add.weeks || 0,
      days: aiDateTimeInput.add.days || 0,
      hours: aiDateTimeInput.add.hours || 0,
      minutes: aiDateTimeInput.add.minutes || 0,
      seconds: aiDateTimeInput.add.seconds || 0,
    };
    workingUserLocalTime = add(workingUserLocalTime, addDuration);
    if (!isValid(workingUserLocalTime)) {
      console.error(
        "[processAiDateTimeInput] Date became invalid after 'add' operation.",
        aiDateTimeInput.add
      );
      return null;
    }
  }

  // 3. Apply absolute 'set' components.
  // These operations also apply to `workingUserLocalTime`.
  let timeWasExplicitlySet = false; // Track if H, M, S were set by AI
  let dateWasExplicitlySet = false; // Track if Y, M, D were set by AI

  if (aiDateTimeInput.set) {
    const setValues: { [key in keyof DateValues]?: number } = {};

    if (aiDateTimeInput.set.years !== undefined) {
      setValues.year = aiDateTimeInput.set.years;
      dateWasExplicitlySet = true;
    }
    if (aiDateTimeInput.set.months !== undefined) {
      // AI provides month 1-12, date-fns `set` expects month 0-11 for `month` property.
      setValues.month = aiDateTimeInput.set.months - 1;
      dateWasExplicitlySet = true;
    }
    if (aiDateTimeInput.set.days !== undefined) {
      setValues.date = aiDateTimeInput.set.days;
      dateWasExplicitlySet = true;
    } // 'date' for day of the month

    if (aiDateTimeInput.set.hours !== undefined) {
      setValues.hours = aiDateTimeInput.set.hours;
      timeWasExplicitlySet = true;
    }
    if (aiDateTimeInput.set.minutes !== undefined) {
      setValues.minutes = aiDateTimeInput.set.minutes;
      timeWasExplicitlySet = true;
    }
    if (aiDateTimeInput.set.seconds !== undefined) {
      setValues.seconds = aiDateTimeInput.set.seconds;
      timeWasExplicitlySet = true;
    } else if (timeWasExplicitlySet) {
      // If H or M were set, but S wasn't, default S to 0 for the 'set' operation.
      setValues.seconds = 0;
    }

    if (Object.keys(setValues).length > 0) {
      workingUserLocalTime = set(workingUserLocalTime, setValues);
      if (!isValid(workingUserLocalTime)) {
        console.error(
          "[processAiDateTimeInput] Date became invalid after 'set' operation.",
          aiDateTimeInput.set,
          setValues
        );
        return null;
      }
    }
  }

  // 4. Determine if the result is an "all-day" event/task.
  // An event is considered "all-day" if no time components were explicitly set by the AI,
  // OR if time components were set to the very start of the day (00:00:00).
  // The AI's intent for "all-day" is key. The prompt guides it to omit time for all-day.
  let isAllDay = true;
  if (timeWasExplicitlySet) {
    // If AI set H, M, or S
    isAllDay = false;
  } else if (
    aiDateTimeInput.add &&
    (aiDateTimeInput.add.hours ||
      aiDateTimeInput.add.minutes ||
      aiDateTimeInput.add.seconds)
  ) {
    // If 'add' operation introduced non-zero time components and 'set' didn't override them to 00:00:00 or specify other time.
    isAllDay = false;
  } else if (dateWasExplicitlySet) {
    // If only date parts were set, and no time parts from 'add' or 'set', it's all-day.
    // We should ensure the time is actually 00:00:00 in user's local time.
    workingUserLocalTime = startOfDay(workingUserLocalTime); // Standardize to start of day
    isAllDay = true;
  }

  // Ensure 'all-day' dates truly represent the start of the day in the user's local timezone.
  if (isAllDay) {
    workingUserLocalTime = startOfDay(workingUserLocalTime);
  }

  // 5. Convert the final calculated user-local time back to a UTC Date object for consistent storage.
  const finalDateUTC = fromZonedTime(workingUserLocalTime, userTimezone);

  if (!isValid(finalDateUTC)) {
    console.error('[processAiDateTimeInput] Final UTC date is invalid.', {
      workingUserLocalTime,
      userTimezone,
    });
    return null;
  }

  return {
    finalDateUTC,
    userLocalTime: workingUserLocalTime, // This is the date object representing the moment in user's local timezone
    isAllDay,
  };
}
