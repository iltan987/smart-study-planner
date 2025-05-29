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
import { zodResolver } from '@hookform/resolvers/zod';
import type { CalendarEvent } from '@prisma/client';
import { format, parse } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

interface EventFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: CreateCalendarEventInputSchema) => Promise<void>;
  eventToEdit?: CalendarEvent | null;
  initialDate: Date;
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
  isSubmittingForm,
  isDeletingEvent,
  onDelete,
}: EventFormDialogProps) {
  const isEditMode = !!eventToEdit;

  const defaultFormValues: AddCalendarEventFormSchema = useMemo(
    () => ({
      title: '',
      eventDate: '',
      startTimeLocal: '09:00',
      endTimeLocal: '10:00',
    }),
    []
  );

  const form = useForm<AddCalendarEventFormSchema>({
    resolver: zodResolver(addCalendarEventFormSchema),
    defaultValues: defaultFormValues,
    mode: 'onChange',
  });

  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && eventToEdit) {
        form.reset({
          title: eventToEdit.title,
          eventDate: format(eventToEdit.start, 'PP'),
          startTimeLocal: format(eventToEdit.start, 'HH:mm'),
          endTimeLocal: format(eventToEdit.end, 'HH:mm'),
        });
      } else {
        form.reset({
          ...defaultFormValues,
          eventDate: format(initialDate, 'PP'),
        });
      }
    }
  }, [defaultFormValues, eventToEdit, form, initialDate, isEditMode, isOpen]);

  const handleSubmitLocal = async (formData: AddCalendarEventFormSchema) => {
    if (isSubmittingForm) return;
    const isValidDate = formData.eventDate && formData.eventDate !== '';
    if (!isValidDate) {
      form.setError('eventDate', {
        type: 'manual',
        message: 'Please select a valid date.',
      });
      return;
    }
    if (!formData.startTimeLocal) {
      form.setError('startTimeLocal', {
        type: 'manual',
        message: 'Start time is required.',
      });
      return;
    }
    if (!formData.endTimeLocal) {
      form.setError('endTimeLocal', {
        type: 'manual',
        message: 'End time is required.',
      });
      return;
    }
    if (formData.startTimeLocal === '') {
      form.setError('startTimeLocal', {
        type: 'manual',
        message: 'Start time is required.',
      });
      return;
    }
    if (formData.endTimeLocal === '') {
      form.setError('endTimeLocal', {
        type: 'manual',
        message: 'End time is required.',
      });
      return;
    }
    if (formData.startTimeLocal === formData.endTimeLocal) {
      form.setError('endTimeLocal', {
        type: 'manual',
        message: 'End time must be after start time.',
      });
      return;
    }

    const parsedEventDate = parse(formData.eventDate, 'PP', new Date());
    const startTime = parse(formData.startTimeLocal, 'HH:mm', parsedEventDate);
    const endTime = parse(formData.endTimeLocal, 'HH:mm', parsedEventDate);

    if (startTime >= endTime) {
      form.setError('endTimeLocal', {
        type: 'manual',
        message: 'End time must be after start time.',
      });
      return;
    }

    await onSubmit({
      title: formData.title,
      start: startTime,
      end: endTime,
    });
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
                  <Popover
                    open={isDatePopoverOpen}
                    onOpenChange={setIsDatePopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                          disabled={anyLoading}
                          onClick={() => setIsDatePopoverOpen(true)}
                        >
                          {field.value || <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        weekStartsOn={1}
                        selected={parse(field.value, 'PP', new Date())}
                        onSelect={(date) => {
                          field.onChange(date ? format(date, 'PP') : '');
                          setIsDatePopoverOpen(false);
                        }}
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
