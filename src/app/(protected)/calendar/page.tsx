'use client';

import {
  createCalendarEvent,
  deleteCalendarEvent,
  getCalendarEvents,
  updateCalendarEvent,
} from '@/actions/calendar.action';
import { CalendarLoadingComponent } from '@/components/calendar/CalendarLoadingComponent';
import { EventFormDialog } from '@/components/calendar/EventFormDialog';
import { WeeklyCalendarView } from '@/components/calendar/WeeklyCalendarView';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ValidationException } from '@/errors/ValidationException';
import type {
  CreateCalendarEventInputSchema,
  GetCalendarEventsInputSchema,
  UpdateCalendarEventInputSchema,
} from '@/schemas/calendar.schema';
import type { YearMonthDate } from '@/schemas/time.schema';
import type { OmitTyped } from '@/types/omit';
import {
  formatToReadableDate,
  getStartOfWeekMonday,
  isDateToday,
} from '@/utils/client-date.util';
import type { CalendarEvent } from '@prisma/client';
import { addDays, addWeeks, subWeeks } from 'date-fns';
import {
  CalendarIcon as CalendarIconLucide,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

type ClientCalendarEvent = CalendarEvent & {
  tempId?: string;
  _isAdding?: boolean;
  _isDeleting?: boolean;
  _isUpdating?: boolean;
};

export default function CalendarPage() {
  const { data: session, status } = useSession({ required: true });

  const userTimezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    []
  );

  const [today, setToday] = useState<Date>();
  useEffect(() => {
    setToday(new Date());
  }, []);

  const [weekStartDate, setWeekStartDate] = useState<Date>();
  useEffect(() => {
    if (!today) return;
    setWeekStartDate(getStartOfWeekMonday(today));
  }, [today]);

  const [weekEndDate, setWeekEndDate] = useState<Date>();
  useEffect(() => {
    if (!weekStartDate) return;
    setWeekEndDate(addDays(weekStartDate, 6));
  }, [weekStartDate]);

  const [events, setEvents] = useState<ClientCalendarEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ClientCalendarEvent | null>(
    null
  );
  const [selectedCellDate, setSelectedCellDate] = useState<Date | null>(null);

  const [isSubmittingEventForm, setIsSubmittingEventForm] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const deletingEvent = useMemo(
    () => events.find((e) => e.id === deletingEventId),
    [events, deletingEventId]
  );

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const convertedWeekStartDateForAPI = useMemo(() => {
    return (
      weekStartDate && {
        year: weekStartDate.getFullYear(),
        month: weekStartDate.getMonth() + 1,
        date: weekStartDate.getDate(),
      }
    );
  }, [weekStartDate]);

  const weekTitle = useMemo(() => {
    if (!weekStartDate || !weekEndDate) return;
    return `${formatToReadableDate(
      weekStartDate
    )} - ${formatToReadableDate(weekEndDate)}`;
  }, [weekStartDate, weekEndDate]);

  const fetchAndSetEvents = useCallback(
    async (weekStart: YearMonthDate) => {
      setIsLoadingEvents(true);
      try {
        const res = await getCalendarEvents({
          date: weekStart,
          timezone: userTimezone,
        });

        if (!res.success) {
          if (typeof res.error === 'string') {
            throw new Error(res.error);
          }

          throw new ValidationException<GetCalendarEventsInputSchema>(
            'Failed to fetch calendar events',
            res.error
          );
        }

        setEvents(res.data);
      } catch (err) {
        console.error('Failed to fetch calendar events:', err);
        setEvents([]);
        if (err instanceof Error) {
          toast.error('Could not load events: ' + err.message);
        }
      } finally {
        setIsLoadingEvents(false);
      }
    },
    [userTimezone]
  );

  useEffect(() => {
    if (status === 'authenticated' && convertedWeekStartDateForAPI) {
      fetchAndSetEvents(convertedWeekStartDateForAPI);
    }
  }, [status, convertedWeekStartDateForAPI, fetchAndSetEvents]);

  const handlePreviousWeek = () =>
    setWeekStartDate((prev) => prev && getStartOfWeekMonday(subWeeks(prev, 1)));
  const handleNextWeek = () =>
    setWeekStartDate((prev) => prev && getStartOfWeekMonday(addWeeks(prev, 1)));
  const handleToday = () => setWeekStartDate(getStartOfWeekMonday(new Date()));

  const handleAddEventSubmit = async (
    data: OmitTyped<CreateCalendarEventInputSchema, 'clientTimezone'>
  ) => {
    if (!session?.user.id) {
      toast.error('Authentication error.');
      return;
    }

    setIsSubmittingEventForm(true);

    // Dialog should close immediately as per request
    setIsEventFormOpen(false);

    const tempId = `optimistic-event-${Date.now()}`;

    const optimisticEvent: ClientCalendarEvent = {
      id: tempId,
      tempId: tempId,
      userId: session.user.id,
      title: data.title,
      startTime: new Date(
        data.eventDate.year,
        data.eventDate.month - 1,
        data.eventDate.date,
        data.startTimeLocal.hours,
        data.startTimeLocal.minutes
      ),
      endTime: new Date(
        data.eventDate.year,
        data.eventDate.month - 1,
        data.eventDate.date,
        data.endTimeLocal.hours,
        data.endTimeLocal.minutes
      ),
      createdAt: new Date(),
      updatedAt: new Date(),
      _isAdding: true,
    };

    setEvents((prev) => [...prev, optimisticEvent]);

    try {
      const result = await createCalendarEvent({
        ...data,
        clientTimezone: userTimezone,
      });

      if (result.success) {
        toast.success(`Event "${result.data.title}" created successfully.`);
        // Replace optimistic event with real one
        setEvents((prev) =>
          prev.map((e) =>
            e.tempId === tempId ? { ...result.data, _isAdding: false } : e
          )
        );
      } else {
        const errorMessage =
          typeof result.error === 'string'
            ? result.error
            : 'Failed to create event.';
        toast.error(errorMessage);
        if (
          result.error &&
          typeof result.error !== 'string' &&
          result.error.fieldErrors
        ) {
          Object.entries(result.error.fieldErrors).forEach(
            ([field, errors]) => {
              if (errors) toast.error(`${field}: ${errors.join(', ')}`);
            }
          );
        }
        setEvents((prev) => prev.filter((e) => e.tempId !== tempId));
      }
    } catch (err) {
      console.error('Create event error:', err);
      toast.error('An unexpected error occurred while creating the event.');
      setEvents((prev) => prev.filter((e) => e.tempId !== tempId));
    } finally {
      setIsSubmittingEventForm(false);
    }
  };

  const handleUpdateEventSubmit = async (
    formData: OmitTyped<CreateCalendarEventInputSchema, 'clientTimezone'>
  ) => {
    if (!session?.user.id) {
      toast.error('Authentication error.');
      return;
    }
    if (!editingEvent) {
      toast.error('Cannot update event. Required information missing.');
      return;
    }
    const originalEvent = events.find((e) => e.id === editingEvent.id);
    if (!originalEvent) {
      toast.error('Original event not found for update.');
      return;
    }

    setIsSubmittingEventForm(true);

    // Dialog should close immediately
    setIsEventFormOpen(false);

    // Optimistic update: Apply changes immediately to the UI
    setEvents((prevEvents) =>
      prevEvents.map((e) =>
        e.id === editingEvent.id
          ? {
              ...e,
              title: formData.title,
              startTime: new Date(
                formData.eventDate.year,
                formData.eventDate.month - 1,
                formData.eventDate.date,
                formData.startTimeLocal.hours,
                formData.startTimeLocal.minutes
              ),
              endTime: new Date(
                formData.eventDate.year,
                formData.eventDate.month - 1,
                formData.eventDate.date,
                formData.endTimeLocal.hours,
                formData.endTimeLocal.minutes
              ),
              _isUpdating: true,
            }
          : e
      )
    );

    try {
      const updatePayload: UpdateCalendarEventInputSchema = {
        eventId: editingEvent.id,
        title: formData.title,
        eventDate: formData.eventDate,
        startTimeLocal: formData.startTimeLocal,
        endTimeLocal: formData.endTimeLocal,
        clientTimezone: userTimezone,
      };

      const result = await updateCalendarEvent(updatePayload);

      if (result.success) {
        toast.success(`Event "${result.data.title}" updated successfully.`);
        setEvents((prevEvents) =>
          prevEvents.map((e) =>
            e.id === result.data.id
              ? { ...result.data, _isUpdating: false, _isAdding: false }
              : e
          )
        );
      } else {
        const errorMsg =
          typeof result.error === 'string'
            ? result.error
            : result.error?.formErrors?.join(', ') || result.error?.fieldErrors
              ? Object.values(result.error.fieldErrors).flat().join(', ')
              : 'Failed to update event.';
        toast.error(errorMsg);
        // Revert optimistic update
        setEvents((prevEvents) =>
          prevEvents.map((e) =>
            e.id === editingEvent.id
              ? { ...originalEvent, _isUpdating: false }
              : e
          )
        );
      }
    } catch (err) {
      console.error('Update event error:', err);
      toast.error('An unexpected error occurred while updating the event.');
      setEvents((prevEvents) =>
        prevEvents.map((e) =>
          e.id === editingEvent.id
            ? { ...originalEvent, _isUpdating: false }
            : e
        )
      );
    } finally {
      setIsSubmittingEventForm(false);
    }
  };

  const handleDeleteInitiate = (eventId: string) => {
    setDeletingEventId(eventId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogConfirm = async () => {
    if (deletingEventId) {
      setDeleteDialogOpen(false);
      await handleDeleteConfirm(deletingEventId);
    }
  };

  const handleDeleteConfirm = async (eventId: string) => {
    if (!session?.user.id) {
      toast.error('Authentication error.');
      return;
    }
    const eventToDelete = events.find((e) => e.id === eventId);
    if (!eventToDelete) {
      toast.warning('Event not found for deletion.');
      return;
    }

    setDeletingEventId(eventId); // Set ID for delete button in dialog

    // Dialog should close immediately
    setIsEventFormOpen(false);

    // Optimistic UI: Mark as deleting
    setEvents((prevEvents) =>
      prevEvents.map((e) =>
        e.id === eventId ? { ...e, _isDeleting: true } : e
      )
    );

    try {
      const result = await deleteCalendarEvent({ eventId });
      if (result.success) {
        toast.success(`Event "${eventToDelete.title}" deleted successfully.`);
        // Remove the event from the list
        setEvents((prevEvents) => prevEvents.filter((e) => e.id !== eventId));
      } else {
        const errorMsg =
          typeof result.error === 'string'
            ? result.error
            : 'Failed to delete event.';
        toast.error(errorMsg);
        // Revert optimistic UI
        setEvents((prevEvents) =>
          prevEvents.map((e) =>
            e.id === eventId ? { ...eventToDelete, _isDeleting: false } : e
          )
        );
      }
    } catch (err) {
      console.error('Delete event error:', err);
      toast.error('An unexpected error occurred while deleting the event.');
      setEvents((prevEvents) =>
        prevEvents.map((e) =>
          e.id === eventId ? { ...eventToDelete, _isDeleting: false } : e
        )
      );
    }
  };

  const handleCalendarCellClick = (date: Date) => {
    setEditingEvent(null); // Ensure we are in "add" mode
    setSelectedCellDate(date);
    setIsEventFormOpen(true);
  };

  const handleEventItemEdit = (event: ClientCalendarEvent) => {
    setSelectedCellDate(null);
    setEditingEvent(event); // Ensure we are in "edit" mode
    setIsEventFormOpen(true);
  };

  if (status === 'loading') {
    return <CalendarLoadingComponent />;
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6 h-full">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <CalendarIconLucide className="h-6 w-6 text-primary" />
                Calendar
              </CardTitle>
              <CardDescription>
                {weekTitle || <Skeleton className="h-5 w-50" />}
              </CardDescription>
            </div>
            <div className="flex gap-2 items-center">
              <Button
                variant="outline"
                onClick={handlePreviousWeek}
                size="icon"
                aria-label="Previous week"
                disabled={!weekStartDate || isLoadingEvents}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={handleToday}
                disabled={
                  !today ||
                  !weekStartDate ||
                  (isDateToday(today) &&
                    getStartOfWeekMonday(today).getTime() ===
                      weekStartDate.getTime()) ||
                  isLoadingEvents
                }
              >
                Today
              </Button>
              <Button
                variant="outline"
                onClick={handleNextWeek}
                size="icon"
                aria-label="Next week"
                disabled={!weekStartDate || isLoadingEvents}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => today && handleCalendarCellClick(today)}
                size="sm"
                className="ml-2"
                disabled={!today || isLoadingEvents}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Event
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Calendar View Card */}
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <WeeklyCalendarView
              weekStartDate={weekStartDate}
              weekEndDate={weekEndDate}
              events={events}
              userTimezone={userTimezone}
              onCellClick={handleCalendarCellClick}
              onEventEdit={handleEventItemEdit}
              onEventDeleteInitiate={handleDeleteInitiate}
              isLoadingEvents={isLoadingEvents}
            />
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!open) setDeleteDialogOpen(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingEvent ? (
                <>
                  Are you sure you want to delete &quot;
                  <strong>{deletingEvent.title}</strong>
                  &quot;?
                </>
              ) : (
                'Are you sure you want to delete this event?'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDialogConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Event Form Dialog for Add/Edit */}
      <EventFormDialog
        isOpen={isEventFormOpen}
        onOpenChange={() => setIsEventFormOpen(false)}
        onSubmit={editingEvent ? handleUpdateEventSubmit : handleAddEventSubmit}
        eventToEdit={editingEvent}
        initialDate={
          editingEvent ? undefined : selectedCellDate || weekStartDate
        }
        userTimezone={userTimezone}
        isSubmittingForm={isSubmittingEventForm}
        isDeletingEvent={!!editingEvent && deletingEventId === editingEvent.id}
        onDelete={editingEvent ? handleDeleteConfirm : undefined}
      />
    </div>
  );
}
