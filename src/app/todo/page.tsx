'use client';

import {
  createDailyTodo,
  deleteTodo,
  getTodos,
  markAs,
} from '@/actions/todo.action';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Category, Priority, Status } from '@/generated/prisma-client';
import type {
  CreateDailyTodoSchema,
  GetTodosResponseSchema,
} from '@/schemas/todo.schema';
import { createDailyTodoSchema } from '@/schemas/todo.schema';
import { format } from 'date-fns';
import {
  CheckCircle2,
  Circle,
  Clock,
  Filter,
  MoreHorizontal,
  Plus,
  XCircle,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const TodoList: React.FC = () => {
  const { data, status } = useSession();

  if (status === 'unauthenticated') {
    redirect('/login');
  }

  const [tasks, setTasks] = useState<GetTodosResponseSchema[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState<CreateDailyTodoSchema>({
    title: '',
    status: 'pending',
    priority: 'medium',
    category: 'study',
  });
  const [selectedFilter, setSelectedFilter] = useState<Status | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getMyTodos = async () => {
      if (!data?.user.id) return;

      try {
        setError(null);
        const date = new Date();

        // Get start as the beginning of the day (00:00:00.000)
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        // Get end as the end of the day (23:59:59.999)
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        const todos = await getTodos(data.user.id, start, end);
        if (todos.success) {
          setTasks(todos.data);
        } else {
          setError(
            typeof todos.error === 'string'
              ? todos.error
              : 'Failed to fetch todos'
          );
          console.error('Error fetching todos:', todos.error);
        }
      } catch (error) {
        setError('Failed to fetch todos');
        console.error('Error fetching todos:', error);
      } finally {
        setLoading(false);
      }
    };
    getMyTodos();
  }, [data?.user?.id]);

  // Calculate task stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (task) => task.status === 'completed'
  ).length;
  const pendingTasks = tasks.filter((task) => task.status === 'pending').length;
  const missedTasks = tasks.filter((task) => task.status === 'missed').length;
  const completionRate =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Handle quick add task
  const handleQuickAddTask = async () => {
    if (!data?.user.id || !newTaskTitle.trim()) return;

    try {
      setError(null);
      const addTodo = createDailyTodoSchema.parse({
        title: newTaskTitle.trim(),
        dueTime: {
          hours: 23,
          minutes: 59,
        },
      } as CreateDailyTodoSchema);

      const res = await createDailyTodo(data.user.id, addTodo);
      if (res.success) {
        const { dueTime, ...rest } = addTodo;
        setTasks((prev) => [
          {
            id: res.data,
            ...rest,
            dueTime:
              dueTime &&
              new Date(new Date().setHours(dueTime.hours, dueTime.minutes)),
          },
          ...prev,
        ]);
        setNewTaskTitle('');
      } else {
        setError(
          typeof res.error === 'string' ? res.error : 'Failed to create task'
        );
        console.error('Error creating quick task:', res.error);
      }
    } catch (error) {
      setError('Failed to create task');
      console.error('Error creating quick task:', error);
    }
  };

  // Handle add task with details
  const handleAddDetailedTask = async () => {
    if (!data?.user.id || !newTask.title.trim()) return;

    try {
      setError(null);
      const parsedTodo = createDailyTodoSchema.safeParse({
        ...newTask,
        title: newTask.title.trim(),
        dueTime: newTask.dueTime || {
          hours: 23,
          minutes: 59,
        },
      });

      if (!parsedTodo.success) {
        setError(
          parsedTodo.error.errors
            .map((err) => `${err.path.join('.')}: ${err.message}`)
            .join(', ')
        );
        return;
      }

      const res = await createDailyTodo(data.user.id, parsedTodo.data);
      if (res.success) {
        const { dueTime, ...rest } = parsedTodo.data;
        setTasks((prev) => [
          {
            id: res.data,
            ...rest,
            dueTime:
              dueTime &&
              new Date(new Date().setHours(dueTime.hours, dueTime.minutes)),
          },
          ...prev,
        ]);
        setIsAddingTask(false);
        setNewTask({
          title: '',
          status: 'pending',
          priority: 'medium',
          category: 'study',
        });
      } else {
        setError(
          typeof res.error === 'string' ? res.error : 'Failed to create task'
        );
        console.error('Error creating detailed task:', res.error);
      }
    } catch (error) {
      setError('Failed to create task');
      console.error('Error creating detailed task:', error);
    }
  };

  // Update task status
  const updateTaskStatus = async (taskId: string, newStatus: Status) => {
    if (!data?.user.id) return;

    try {
      setError(null);

      const res = await markAs(data.user.id, taskId, newStatus);
      if (res.success) {
        setTasks(
          tasks.map((task) =>
            task.id === taskId ? { ...task, status: newStatus } : task
          )
        );
      } else {
        setError(
          typeof res.error === 'string'
            ? res.error
            : 'Failed to update task status'
        );
        console.error('Error updating task status:', res.error);
      }
    } catch (error) {
      setError('Failed to update task status');
      console.error('Error updating task status:', error);
    }
  };

  // Delete task
  const deleteTask = async (taskId: string) => {
    if (!data?.user.id) return;

    try {
      setError(null);
      const res = await deleteTodo(data.user.id, taskId);
      if (res.success) {
        setTasks(tasks.filter((task) => task.id !== taskId));
      } else {
        setError(
          typeof res.error === 'string' ? res.error : 'Failed to delete task'
        );
        console.error('Error deleting task:', res.error);
      }
    } catch (error) {
      setError('Failed to delete task');
      console.error('Error deleting task:', error);
    }
  };

  // Filter tasks based on selected filter
  const filteredTasks = (
    selectedFilter === 'all'
      ? tasks
      : tasks.filter((task) => task.status === selectedFilter)
  ).sort((a, b) => {
    // sort first by priority descending then dueTime
    const priorityOrder = {
      high: 3,
      medium: 2,
      low: 1,
    };
    const aPriority = priorityOrder[a.priority ?? 'low'] || 0;
    const bPriority = priorityOrder[b.priority ?? 'low'] || 0;
    if (aPriority !== bPriority) {
      return bPriority - aPriority; // Sort by priority descending
    }
    if (a.dueTime && b.dueTime) {
      return a.dueTime.getTime() - b.dueTime.getTime(); // Sort by dueTime ascending
    }
    if (a.dueTime) return -1; // a has dueTime, b doesn't

    if (b.dueTime) return 1; // b has dueTime, a doesn't
    return 0; // both have no dueTime
  });

  // Get status icon
  const getStatusIcon = (status?: Status | null) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'missed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Circle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority?: Priority | null) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="default">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return null;
    }
  };

  // Get category badge
  const getCategoryBadge = (category?: Category | null) => {
    switch (category) {
      case 'study':
        return <Badge variant="secondary">Study</Badge>;
      case 'assignment':
        return <Badge className="bg-indigo-600">Assignment</Badge>;
      case 'exam':
        return <Badge className="bg-purple-600">Exam</Badge>;
      case 'work':
        return <Badge className="bg-green-600">Work</Badge>;
      case 'gym':
        return <Badge className="bg-red-600">Gym</Badge>;
      default:
        return <Badge variant="outline">Other</Badge>;
    }
  };

  // Get today's date
  const todayDate = format(new Date(), 'EEEE, MMMM d, yyyy');

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Daily Tasks</h1>
            <p className="text-gray-500">{todayDate}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
              <DialogTrigger asChild>
                <Button disabled={status === 'loading' || loading}>
                  <Plus className="mr-2 h-4 w-4" /> Add Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Task</DialogTitle>
                  <DialogDescription>
                    Create a new task with details to track your progress.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="task-title">Task Title</Label>
                    <Input
                      id="task-title"
                      placeholder="Enter task title"
                      value={newTask.title}
                      onChange={(e) =>
                        setNewTask({ ...newTask, title: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-description">
                      Description (Optional)
                    </Label>
                    <Input
                      id="task-description"
                      placeholder="Add more details"
                      value={newTask.description || ''}
                      onChange={(e) =>
                        setNewTask({ ...newTask, description: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="task-priority">Priority</Label>
                      <Select
                        value={newTask.priority}
                        onValueChange={(value) =>
                          setNewTask({
                            ...newTask,
                            priority: value as Priority,
                          })
                        }
                      >
                        <SelectTrigger id="task-priority">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="task-category">Category</Label>
                      <Select
                        value={newTask.category}
                        onValueChange={(value) =>
                          setNewTask({
                            ...newTask,
                            category: value as Category,
                          })
                        }
                      >
                        <SelectTrigger id="task-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="study">Study</SelectItem>
                          <SelectItem value="assignment">Assignment</SelectItem>
                          <SelectItem value="exam">Exam</SelectItem>
                          <SelectItem value="work">Work</SelectItem>
                          <SelectItem value="gym">Gym</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="task-time">Due Time (Optional)</Label>
                      <Input
                        id="task-time"
                        type="time"
                        value={
                          newTask.dueTime
                            ? String(newTask.dueTime.hours).padStart(2, '0') +
                              ':' +
                              String(newTask.dueTime.minutes).padStart(2, '0')
                            : ''
                        }
                        onChange={(e) => {
                          setNewTask({
                            ...newTask,
                            dueTime: e.target.valueAsDate
                              ? {
                                  hours: e.target.valueAsDate.getUTCHours(),
                                  minutes: e.target.valueAsDate.getUTCMinutes(),
                                }
                              : undefined,
                          });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="task-duration">Duration (mins)</Label>
                      <Input
                        id="task-duration"
                        type="number"
                        min="1"
                        placeholder="Estimated minutes"
                        value={newTask.duration || ''}
                        onChange={(e) =>
                          setNewTask({
                            ...newTask,
                            duration: e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingTask(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddDetailedTask} disabled={loading}>
                    Add Task
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Quick Add Task Bar */}
        <div className="flex space-x-2">
          <Input
            placeholder="Add a quick task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleQuickAddTask();
            }}
          />
          <Button onClick={handleQuickAddTask} disabled={loading}>
            Add
          </Button>
        </div>

        {error && (
          <div
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Task Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTasks}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {completedTasks}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {pendingTasks}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Missed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {missedTasks}
              </div>
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
              <Progress value={completionRate} className="h-2" />
              <div className="text-xs text-gray-500">
                You have completed {completedTasks} of {totalTasks} tasks (
                {Math.round(completionRate)}%)
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  {selectedFilter === 'all'
                    ? 'All Tasks'
                    : selectedFilter === 'completed'
                      ? 'Completed'
                      : selectedFilter === 'pending'
                        ? 'Pending'
                        : 'Missed'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-0" align="start">
                <div className="p-2">
                  <Button
                    variant={selectedFilter === 'all' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setSelectedFilter('all')}
                  >
                    All Tasks
                  </Button>
                  <Button
                    variant={selectedFilter === 'pending' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setSelectedFilter('pending')}
                  >
                    <Circle className="h-4 w-4 mr-2 text-gray-400" />
                    Pending
                  </Button>
                  <Button
                    variant={
                      selectedFilter === 'completed' ? 'default' : 'ghost'
                    }
                    className="w-full justify-start"
                    onClick={() => setSelectedFilter('completed')}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                    Completed
                  </Button>
                  <Button
                    variant={selectedFilter === 'missed' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setSelectedFilter('missed')}
                  >
                    <XCircle className="h-4 w-4 mr-2 text-red-500" />
                    Missed
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="text-sm text-gray-500">
            Showing {filteredTasks.length}{' '}
            {selectedFilter === 'all' ? 'tasks' : selectedFilter + ' tasks'}
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <p className="text-gray-500 text-center">No tasks found</p>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => setIsAddingTask(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add your first task
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredTasks.map((task) => (
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <button
                        className="mt-1"
                        onClick={() => {
                          if (task.status === 'pending') {
                            updateTaskStatus(task.id, 'completed');
                          } else if (task.status === 'completed') {
                            updateTaskStatus(task.id, 'pending');
                          }
                        }}
                      >
                        {getStatusIcon(task.status)}
                      </button>
                      <div className="space-y-1">
                        <div>
                          <h3
                            className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}
                          >
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-sm text-gray-500 mt-1">
                              {task.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          {getPriorityBadge(task.priority)}
                          {getCategoryBadge(task.category)}
                          {task.dueTime && (
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              {task.dueTime.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          )}
                          {task.duration && (
                            <div className="text-xs text-gray-500">
                              {task.duration} min
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => updateTaskStatus(task.id, 'completed')}
                          disabled={task.status === 'completed'}
                        >
                          Mark as Completed
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateTaskStatus(task.id, 'pending')}
                          disabled={task.status === 'pending'}
                        >
                          Mark as Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateTaskStatus(task.id, 'missed')}
                          disabled={task.status === 'missed'}
                        >
                          Mark as Missed
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => deleteTask(task.id)}
                          className="text-red-600"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TodoList;
