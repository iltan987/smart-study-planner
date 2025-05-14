import type { DateTimeModificationSchema } from '@/schemas/todo.schema';
import { add, set } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';

function processDateWithTimezone(
  date: Date,
  timeZone: string,
  operations: DateTimeModificationSchema
) {
  if (!operations.duration_to_add && !operations.duration_to_set) {
    return {
      success: false,
      message:
        'At least one of duration_to_add or duration_to_set must be present in operations',
    };
  }

  let workingDate = date;

  // Convert to UTC based on the provided timezone. Crucial for accuracy.
  workingDate = fromZonedTime(workingDate, timeZone);
  if (operations.duration_to_add) {
    workingDate = add(workingDate, operations.duration_to_add);
  }

  if (operations.duration_to_set) {
    workingDate = set(workingDate, operations.duration_to_set);
  }

  //Convert back to the specified timezone
  workingDate = toZonedTime(workingDate, timeZone);

  return {
    success: true,
    data: new Date(workingDate), // Convert back to a standard Date object.  Crucial!
  };
}

export { processDateWithTimezone };
