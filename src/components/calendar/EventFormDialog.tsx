import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type {
  AddCalendarEventFormSchema,
  CreateCalendarEventInputSchema,
} from '@/schemas/calendar.schema';
import { addCalendarEventFormSchema } from '@/schemas/calendar.schema';
import type { HoursMinutes, YearMonthDate } from '@/schemas/time.schema';
import type { OmitTyped } from '@/types/omit';
import { formatToYYYYMMDD } from '@/utils/client-date.util';
import { zodResolver } from '@hookform/resolvers/zod';
import type { CalendarEvent } from '@prisma/client';
import { format, parse, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

interface EventFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (
    data: OmitTyped<CreateCalendarEventInputSchema, 'clientTimezone'>
  ) => Promise<void>;
  eventToEdit?: CalendarEvent | null;
  initialDate?: Date;
  userTimezone: string;
  isSubmittingForm?: boolean;
  isDeletingEvent?: boolean;
  onDelete?: (eventId: string) => Promise<void>;
}

export function EventFormDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  eventToEdit,
  initialDate,
  userTimezone,
  isSubmittingForm,
  isDeletingEvent,
  onDelete,
}: EventFormDialogProps) {
  const isEditMode = !!eventToEdit;

  const defaultFormValues: AddCalendarEventFormSchema = useMemo(
    () => ({
      title: '',
      eventDate: initialDate
        ? format(initialDate, 'yyyy-MM-dd')
        : format(new Date(), 'yyyy-MM-dd'),
      startTimeLocal: '09:00',
      endTimeLocal: '10:00',
    }),
    [initialDate]
  );

  const form = useForm<AddCalendarEventFormSchema>({
    resolver: zodResolver(addCalendarEventFormSchema),
    defaultValues: defaultFormValues,
    mode: 'onChange',
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && eventToEdit) {
        const localStartTime = toZonedTime(
          typeof eventToEdit.startTime === 'string'
            ? parseISO(eventToEdit.startTime)
            : eventToEdit.startTime,
          userTimezone
        );
        const localEndTime = toZonedTime(
          typeof eventToEdit.endTime === 'string'
            ? parseISO(eventToEdit.endTime)
            : eventToEdit.endTime,
          userTimezone
        );
        form.reset({
          title: eventToEdit.title,
          eventDate: format(localStartTime, 'yyyy-MM-dd'),
          startTimeLocal: format(localStartTime, 'HH:mm'),
          endTimeLocal: format(localEndTime, 'HH:mm'),
        });
      } else {
        const dateToUse = initialDate || new Date();
        form.reset({
          ...defaultFormValues,
          eventDate: format(dateToUse, 'yyyy-MM-dd'),
        });
      }
    }
  }, [
    defaultFormValues,
    eventToEdit,
    form,
    initialDate,
    isEditMode,
    isOpen,
    userTimezone,
  ]);

  const handleSubmitLocal = async (formData: AddCalendarEventFormSchema) => {
    const [year, month, day] = formData.eventDate.split('-').map(Number);
    const eventDateObj: YearMonthDate = { year, month, date: day };

    const [startHours, startMinutes] = formData.startTimeLocal
      .split(':')
      .map(Number);
    const startTimeObj: HoursMinutes = {
      hours: startHours,
      minutes: startMinutes,
    };

    const [endHours, endMinutes] = formData.endTimeLocal.split(':').map(Number);
    const endTimeObj: HoursMinutes = { hours: endHours, minutes: endMinutes };

    const submissionData: OmitTyped<
      CreateCalendarEventInputSchema,
      'clientTimezone'
    > = {
      title: formData.title,
      eventDate: eventDateObj,
      startTimeLocal: startTimeObj,
      endTimeLocal: endTimeObj,
    };

    await onSubmit(submissionData);
  };

  const handleDeleteClick = async () => {
    if (isEditMode && eventToEdit && onDelete) {
      await onDelete(eventToEdit.id);
    }
  };

  const anyLoading = isSubmittingForm || isDeletingEvent;

  return (
    <Dialog open={isOpen} onOpenChange={anyLoading ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Event' : 'Add New Event'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the details of your event.'
              : 'Fill in the details for your new calendar event.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmitLocal)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Team Meeting"
                      disabled={anyLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="eventDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                          disabled={anyLoading}
                        >
                          {field.value ? (
                            format(
                              parse(field.value, 'yyyy-MM-dd', new Date()),
                              'PPP'
                            )
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          field.value
                            ? parse(field.value, 'yyyy-MM-dd', new Date())
                            : undefined
                        }
                        onSelect={(date) =>
                          field.onChange(date ? formatToYYYYMMDD(date) : '')
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTimeLocal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} disabled={anyLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTimeLocal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} disabled={anyLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4">
              {isEditMode && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteClick}
                  disabled={anyLoading}
                  className="mr-auto"
                >
                  {isDeletingEvent ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Event'
                  )}
                </Button>
              )}
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={anyLoading}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={anyLoading}>
                {isSubmittingForm ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                    {isEditMode ? 'Saving...' : 'Adding...'}
                  </>
                ) : isEditMode ? (
                  'Save Changes'
                ) : (
                  'Add Event'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
