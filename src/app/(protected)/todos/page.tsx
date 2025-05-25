'use client';

import {
  createTodo,
  deleteTodo,
  getTodos,
  updateTodoStatus,
} from '@/actions/todos.action';
import { AddTodoDialog } from '@/components/todos/AddTodoDialog';
import { TodoItem } from '@/components/todos/TodoItem';
import { TodosLoadingComponent } from '@/components/todos/TodosLoadingComponent';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ValidationException } from '@/errors/ValidationException';
import { cn } from '@/lib/utils';
import type { YearMonthDate } from '@/schemas/time.schema';
import type {
  CreateTodoInputSchema,
  GetTodosInputSchema,
} from '@/schemas/todos.schema';
import type { OmitTyped } from '@/types/omit';
import { formatToReadableDate } from '@/utils/client-date.util';
import type { Todo } from '@prisma/client';
import { TodoCategory, TodoPriority, TodoStatus } from '@prisma/client';
import { addDays, isSameDay, startOfDay, subDays } from 'date-fns';
import {
  CalendarIcon as CalendarIconLucide,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Filter,
  ListChecks,
  Plus,
  PlusCircle,
  CalendarDays as TodayIcon,
  XCircle,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import type { FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

type ClientTodo = Todo & {
  tempId?: string;

  _isAdding?: boolean;
  _isUpdatingStatus?: boolean;
  _isDeleting?: boolean;
};

export default function TodosPage() {
  const { data: session, status } = useSession({ required: true });
  const userTimezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    []
  );

  const [selectedDate, setSelectedDate] = useState<Date>();
  useEffect(() => {
    setSelectedDate(new Date());
  }, []);
  const [selectedFilter, setSelectedFilter] = useState<TodoStatus | 'all'>(
    'all'
  );

  const [todos, setTodos] = useState<ClientTodo[]>([]);

  const filteredTodos = useMemo(() => {
    if (selectedFilter === 'all') return todos;
    return todos.filter((todo) => todo.status === selectedFilter);
  }, [selectedFilter, todos]);

  const [isTodosLoading, setIsTodosLoading] = useState(true);

  const [quickTodoTitle, setQuickTodoTitle] = useState('');
  const [isSubmittingQuickTodo, setIsSubmittingQuickTodo] = useState(false);

  const [isAddTodoDialogOpen, setIsAddTodoDialogOpen] = useState(false);
  const [isSubmittingDetailedTodo, setIsSubmittingDetailedTodo] =
    useState(false);

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const convertedSelectedDateForServer = useMemo(() => {
    return (
      selectedDate &&
      ({
        year: selectedDate.getFullYear(),
        month: selectedDate.getMonth() + 1,
        date: selectedDate.getDate(),
      } as YearMonthDate)
    );
  }, [selectedDate]);

  const fetchTodos = useCallback(async () => {
    if (!convertedSelectedDateForServer) return;

    setIsTodosLoading(true);

    try {
      const res = await getTodos({
        date: convertedSelectedDateForServer,
        timezone: userTimezone,
      });

      if (!res.success) {
        if (typeof res.error === 'string') {
          throw new Error(res.error);
        }

        throw new ValidationException<GetTodosInputSchema>(
          'Failed to fetch todos',
          res.error
        );
      }

      setTodos(res.data);
    } catch (error) {
      console.error('Fetch todos error:', error);
      if (error instanceof Error) {
        toast.error('Could not load tasks: ' + error.message);
      }
      throw error;
    }

    setIsTodosLoading(false);
  }, [userTimezone, convertedSelectedDateForServer]);

  useEffect(() => {
    if (status === 'authenticated') fetchTodos();
  }, [fetchTodos, status]);

  // Calculate todo stats such as completed, pending, missed, etc and completion rate
  const todoStats = useMemo(() => {
    const totalTodos = todos.length;
    const completedTodos = todos.filter(
      (todo) => todo.status === TodoStatus.COMPLETED
    ).length;
    const pendingTodos = todos.filter(
      (todo) => todo.status === TodoStatus.PENDING
    ).length;
    const missedTodos = todos.filter(
      (todo) => todo.status === TodoStatus.MISSED
    ).length;
    const completionRate =
      totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;

    return {
      total: totalTodos,
      completed: completedTodos,
      pending: pendingTodos,
      missed: missedTodos,
      completionRate,
    };
  }, [todos]);

  if (status === 'loading') {
    return <TodosLoadingComponent />;
  }

  const handleQuickAddTodo = async (e: FormEvent) => {
    e.preventDefault();
    if (
      !quickTodoTitle.trim() ||
      isSubmittingQuickTodo ||
      !selectedDate ||
      !convertedSelectedDateForServer
    )
      return;

    setIsSubmittingQuickTodo(true);
    const newTempId = `optimistic-add-${Date.now()}`;
    const currentQuickTodoTitle = quickTodoTitle.trim();

    const optimisticTodo: ClientTodo = {
      tempId: newTempId,
      id: newTempId,
      title: currentQuickTodoTitle,
      description: null,
      dueTime: null,
      priority: TodoPriority.MEDIUM,
      category: TodoCategory.STUDY,
      duration: null,
      status: TodoStatus.PENDING,
      userId: session.user.id,
      isAllDay: true,
      date: startOfDay(selectedDate),
      createdAt: new Date(),
      updatedAt: new Date(),
      _isAdding: true,
    };

    setTodos((prevTodos) => [optimisticTodo, ...prevTodos]);
    setQuickTodoTitle('');

    try {
      const payload: CreateTodoInputSchema = {
        title: currentQuickTodoTitle,
        date: convertedSelectedDateForServer,
        clientTimezone: userTimezone,
      };
      const res = await createTodo(payload);

      if (!res.success) {
        if (typeof res.error === 'string') {
          throw new Error(res.error);
        }

        throw new ValidationException<CreateTodoInputSchema>(
          'Failed to create todo',
          res.error
        );
      }

      setTodos((prevTodos) =>
        prevTodos.map((t) =>
          t.tempId === newTempId
            ? {
                ...t,
                ...res.data,
                _isAdding: false,
                tempId: undefined,
              }
            : t
        )
      );
      toast.success(`Todo "${res.data.title}" added!`);
    } catch (error) {
      console.error('Quick add error:', error);
      if (error instanceof Error)
        toast.error('Failed to add todo: ' + error.message);
      setTodos((prevTodos) => prevTodos.filter((t) => t.tempId !== newTempId));
      setQuickTodoTitle(currentQuickTodoTitle);
    } finally {
      setIsSubmittingQuickTodo(false);
    }
  };

  const handleDetailedAddTodo = async (
    formData: OmitTyped<CreateTodoInputSchema, 'clientTimezone' | 'date'>
  ) => {
    if (
      isSubmittingDetailedTodo ||
      !selectedDate ||
      !convertedSelectedDateForServer
    )
      return;
    setIsSubmittingDetailedTodo(true);

    const newTempId = `optimistic-add-${Date.now()}`;
    const optimisticDueTime =
      formData.timeOfDay &&
      new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        formData.timeOfDay.hours,
        formData.timeOfDay.minutes
      );

    const optimisticTodo: ClientTodo = {
      tempId: newTempId,
      id: newTempId,
      title: formData.title,
      description: formData.description || null,
      dueTime: optimisticDueTime || null,
      priority: formData.priority || TodoPriority.MEDIUM,
      category: formData.category || TodoCategory.STUDY,
      duration: formData.duration || null,
      status: formData.status || TodoStatus.PENDING,
      userId: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      isAllDay: !!optimisticDueTime,
      date: startOfDay(selectedDate),
      _isAdding: true,
    };

    setTodos((prevTodos) => [optimisticTodo, ...prevTodos]);

    try {
      const payload: CreateTodoInputSchema = {
        ...formData,
        date: convertedSelectedDateForServer,
        clientTimezone: userTimezone,
      };
      const res = await createTodo(payload);

      if (!res.success) {
        if (typeof res.error === 'string') {
          throw new Error(res.error);
        }

        throw new ValidationException<CreateTodoInputSchema>(
          'Failed to create todo',
          res.error
        );
      }

      setTodos((prevTodos) =>
        prevTodos.map((t) =>
          t.tempId === newTempId
            ? {
                ...t,
                ...res.data,
                _isAdding: false,
                tempId: undefined,
              }
            : t
        )
      );
      toast.success(`Todo "${res.data.title}" added!`);
    } catch (error) {
      console.error('Detailed add error:', error);
      if (error instanceof Error)
        toast.error('Failed to add todo: ' + error.message);
      setTodos((prevTodos) => prevTodos.filter((t) => t.tempId !== newTempId));
    } finally {
      setIsAddTodoDialogOpen(false);
      setIsSubmittingDetailedTodo(false);
    }
  };

  const handleStatusChange = async (todoId: string, newStatus: TodoStatus) => {
    const todoIndex = todos.findIndex((t) => t.id === todoId);
    if (todoIndex === -1) return;

    const originalTodo = todos[todoIndex];
    if (originalTodo.status === newStatus) return;

    const updatedOptimisticTodo: ClientTodo = {
      ...originalTodo,
      status: newStatus,
      _isUpdatingStatus: true,
    };

    setTodos((prevTodos) =>
      prevTodos.map((t) => (t.id === todoId ? updatedOptimisticTodo : t))
    );

    try {
      const res = await updateTodoStatus({ todoId, status: newStatus });
      if (!res.success) {
        if (typeof res.error === 'string') {
          throw new Error(res.error);
        }

        throw new ValidationException(
          'Failed to update todo status',
          res.error
        );
      }

      setTodos((prevTodos) =>
        prevTodos.map((t) =>
          t.id === todoId
            ? {
                ...t,
                _isUpdatingStatus: false,
              }
            : t
        )
      );
      toast.success(`Task status updated!`);
    } catch (error) {
      console.error('Status change error:', error);
      if (error instanceof Error)
        toast.error('Failed to update status: ' + error.message);
      setTodos((prevTodos) =>
        prevTodos.map((t) =>
          t.id === todoId
            ? {
                ...t,
                status: originalTodo.status,
                _isUpdatingStatus: false,
              }
            : t
        )
      );
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    const todoToDelete = todos.find((t) => t.id === todoId);
    if (!todoToDelete) return;

    setTodos((prevTodos) =>
      prevTodos.map((t) =>
        t.id === todoId
          ? {
              ...t,
              _isDeleting: true,
            }
          : t
      )
    );

    try {
      const res = await deleteTodo({ todoId });
      if (!res.success) {
        if (typeof res.error === 'string') {
          throw new Error(res.error);
        }

        throw new ValidationException('Failed to delete todo', res.error);
      }

      setTodos((prevTodos) => prevTodos.filter((t) => t.id !== todoId));
      toast.success(`Task "${todoToDelete.title}" deleted.`);
    } catch (error) {
      console.error('Delete error:', error);
      if (error instanceof Error)
        toast.error('Failed to delete task: ' + error.message);
      setTodos((prevTodos) =>
        prevTodos.map((t) =>
          t.id === todoId
            ? {
                ...t,
                _isDeleting: false,
              }
            : t
        )
      );
    }
  };

  const closeFilterDialog = (filter: TodoStatus | 'all') => {
    setIsFilterOpen(false);
    setSelectedFilter(filter);
  };

  return (
    <>
      <div className="w-full max-w-3xl mx-auto space-y-6">
        {/* Date Controls Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Date</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild disabled={!selectedDate}>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full sm:w-auto justify-start text-left font-normal flex-grow',
                    !selectedDate && 'text-muted-foreground'
                  )}
                  title="Select Date"
                >
                  <CalendarIconLucide className="mr-2 h-4 w-4" />
                  {selectedDate && formatToReadableDate(selectedDate)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                      setIsDatePickerOpen(false);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  setSelectedDate((prev) => prev && subDays(prev, 1))
                }
                size="icon"
                title="Previous Day"
                disabled={
                  !selectedDate
                    ? false
                    : isSameDay(selectedDate, new Date('1900-01-01'))
                }
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedDate(new Date())}
                disabled={
                  !selectedDate ? false : isSameDay(selectedDate, new Date())
                }
                size="icon"
                title="Go Today"
              >
                <TodayIcon className="h-4 w-4" />
                <span className="sr-only">Today</span>
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  setSelectedDate((prev) => prev && addDays(prev, 1))
                }
                size="icon"
                title="Next Day"
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Todos List Section */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <ListChecks className="h-6 w-6 text-primary" /> Tasks for{' '}
                  {selectedDate ? (
                    formatToReadableDate(selectedDate)
                  ) : (
                    <Skeleton className="h-5 w-32" />
                  )}
                </CardTitle>
                <CardDescription>
                  Manage your daily tasks efficiently.
                </CardDescription>
              </div>
              <Button
                onClick={() => setIsAddTodoDialogOpen(true)}
                size="sm"
                className="flex-shrink-0"
                disabled={isSubmittingDetailedTodo}
              >
                <PlusCircle className="h-4 w-4 mr-2" /> Add New Task
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleQuickAddTodo} className="flex gap-2 mb-6">
              <Input
                type="text"
                placeholder="Quick add a new task..."
                value={quickTodoTitle}
                onChange={(e) => setQuickTodoTitle(e.target.value)}
                disabled={isSubmittingQuickTodo}
              />
              <Button
                type="submit"
                disabled={!quickTodoTitle.trim() || isSubmittingQuickTodo}
              >
                {isSubmittingQuickTodo ? 'Adding...' : 'Add'}
              </Button>
            </form>

            {/* Task Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Total Tasks */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isTodosLoading ? (
                    <Skeleton className="h-8 w-10" />
                  ) : (
                    <p className="text-2xl font-bold">{todoStats.total}</p>
                  )}
                </CardContent>
              </Card>

              {/* Completed Tasks */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Completed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isTodosLoading ? (
                    <Skeleton className="h-8 w-10" />
                  ) : (
                    <p className="text-2xl font-bold text-green-600">
                      {todoStats.completed}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Pending Tasks */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  {isTodosLoading ? (
                    <Skeleton className="h-8 w-10" />
                  ) : (
                    <p className="text-2xl font-bold text-amber-600">
                      {todoStats.pending}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Missed Tasks */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Missed</CardTitle>
                </CardHeader>
                <CardContent>
                  {isTodosLoading ? (
                    <Skeleton className="h-8 w-10" />
                  ) : (
                    <p className="text-2xl font-bold text-red-600">
                      {todoStats.missed}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Progress Bar */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Daily Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {isTodosLoading ? (
                    <>
                      <Skeleton className="h-2 w-full" />
                      <Skeleton className="h-4 w-60" />
                    </>
                  ) : (
                    <>
                      <Progress
                        value={todoStats.completionRate}
                        className="h-2"
                      />
                      <div className="text-xs text-gray-500">
                        You have completed {todoStats.completed} of{' '}
                        {todoStats.total} tasks (
                        {todoStats.completionRate.toFixed(2)}%)
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Task Filters */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      {selectedFilter === 'all'
                        ? 'All Tasks'
                        : selectedFilter === 'COMPLETED'
                          ? 'Completed'
                          : selectedFilter === 'PENDING'
                            ? 'Pending'
                            : 'Missed'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-0" align="start">
                    <div className="p-2">
                      <Button
                        variant={selectedFilter === 'all' ? 'default' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => {
                          closeFilterDialog('all');
                        }}
                      >
                        All Tasks
                      </Button>
                      <Button
                        variant={
                          selectedFilter === 'PENDING' ? 'default' : 'ghost'
                        }
                        className="w-full justify-start"
                        onClick={() => closeFilterDialog('PENDING')}
                      >
                        <Circle className="h-4 w-4 mr-2 text-gray-400" />
                        Pending
                      </Button>
                      <Button
                        variant={
                          selectedFilter === 'COMPLETED' ? 'default' : 'ghost'
                        }
                        className="w-full justify-start"
                        onClick={() => closeFilterDialog('COMPLETED')}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                        Completed
                      </Button>
                      <Button
                        variant={
                          selectedFilter === 'MISSED' ? 'default' : 'ghost'
                        }
                        className="w-full justify-start"
                        onClick={() => closeFilterDialog('MISSED')}
                      >
                        <XCircle className="h-4 w-4 mr-2 text-red-500" />
                        Missed
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="text-sm text-gray-500">
                Showing{' '}
                {isTodosLoading ? (
                  <Skeleton className="inline-block h-5 w-6 align-middle" />
                ) : (
                  filteredTodos.length
                )}{' '}
                {selectedFilter === 'all' ? 'tasks' : selectedFilter + ' tasks'}
              </div>
            </div>

            {!isTodosLoading && todos.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <p className="text-gray-500 text-center">No tasks found</p>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => setIsAddTodoDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add your first task
                  </Button>
                </CardContent>
              </Card>
            )}

            {isTodosLoading && (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            )}

            {!isTodosLoading && todos.length > 0 && (
              <div className="space-y-0">
                {filteredTodos
                  .sort((a, b) => {
                    // Sort by isAllDay (e.g., all-day tasks first or last)
                    if (a.isAllDay && !b.isAllDay) return -1; // a (all-day) comes first
                    if (!a.isAllDay && b.isAllDay) return 1; // b (all-day) comes first

                    const priorityOrder: Record<TodoPriority, number> = {
                      [TodoPriority.HIGH]: 1,
                      [TodoPriority.MEDIUM]: 2,
                      [TodoPriority.LOW]: 3,
                    };
                    const priorityA = priorityOrder[a.priority];
                    const priorityB = priorityOrder[b.priority];
                    if (priorityA !== priorityB) return priorityA - priorityB;

                    // Then by Due Time (only for timed events, all-day events might be considered to have same "time rank" here)
                    if (!a.isAllDay && a.dueTime && !b.isAllDay && b.dueTime) {
                      return a.dueTime.getTime() - b.dueTime.getTime();
                    }

                    // Fallback or if both are all-day with same priority
                    return (
                      (a.createdAt?.getTime() || 0) -
                      (b.createdAt?.getTime() || 0)
                    );
                  })
                  .map((todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      userTimezone={userTimezone}
                      onStatusChange={handleStatusChange}
                      onDelete={handleDeleteTodo}
                      isAdding={todo._isAdding}
                      isUpdatingStatus={todo._isUpdatingStatus}
                      isDeleting={todo._isDeleting}
                    />
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {selectedDate && (
        <AddTodoDialog
          isOpen={isAddTodoDialogOpen}
          onOpenChange={setIsAddTodoDialogOpen}
          onSubmit={handleDetailedAddTodo}
          selectedDate={selectedDate}
          isSubmitting={isSubmittingDetailedTodo}
        />
      )}
    </>
  );
}
