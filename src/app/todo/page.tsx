'use client';
import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  XCircle,
  MoreHorizontal,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

// Type definitions
type TaskStatus = 'pending' | 'completed' | 'missed';
type TaskPriority = 'low' | 'medium' | 'high';
type TaskCategory = 'study' | 'assignment' | 'exam' | 'reading' | 'other';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  dueTime?: string;
  estimatedMinutes?: number;
  createdAt: Date;
}

// Sample data
const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Complete Math Assignment',
    description: 'Finish problems 1-20 on page 75',
    status: 'pending',
    priority: 'high',
    category: 'assignment',
    dueTime: '17:00',
    estimatedMinutes: 45,
    createdAt: new Date(),
  },
  {
    id: '2',
    title: 'Read History Chapter 4',
    description: 'Take notes on key events',
    status: 'completed',
    priority: 'medium',
    category: 'reading',
    dueTime: '15:30',
    estimatedMinutes: 30,
    createdAt: new Date(),
  },
  {
    id: '3',
    title: 'Review Physics Formulas',
    description: 'Focus on chapters 7-9 for quiz tomorrow',
    status: 'missed',
    priority: 'high',
    category: 'study',
    dueTime: '20:00',
    estimatedMinutes: 60,
    createdAt: new Date(),
  },
  {
    id: '4',
    title: 'Prepare English Presentation',
    description: 'Create outline and slides',
    status: 'pending',
    priority: 'medium',
    category: 'assignment',
    dueTime: '22:00',
    estimatedMinutes: 90,
    createdAt: new Date(),
  },
  {
    id: '5',
    title: 'Schedule Study Group',
    description: 'Coordinate with classmates for weekend session',
    status: 'completed',
    priority: 'low',
    category: 'other',
    estimatedMinutes: 15,
    createdAt: new Date(),
  },
];

const TodoList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    category: 'study',
  });
  const [selectedFilter, setSelectedFilter] = useState<TaskStatus | 'all'>(
    'all'
  );

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
  const handleQuickAddTask = () => {
    if (newTaskTitle.trim() === '') return;

    const newTaskItem: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      status: 'pending',
      priority: 'medium',
      category: 'study',
      createdAt: new Date(),
    };

    setTasks([newTaskItem, ...tasks]);
    setNewTaskTitle('');
  };

  // Handle add task with details
  const handleAddDetailedTask = () => {
    if (!newTask.title || newTask.title.trim() === '') return;

    const taskToAdd: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      status: (newTask.status as TaskStatus) || 'pending',
      priority: (newTask.priority as TaskPriority) || 'medium',
      category: (newTask.category as TaskCategory) || 'study',
      dueTime: newTask.dueTime,
      estimatedMinutes: newTask.estimatedMinutes,
      createdAt: new Date(),
    };

    setTasks([taskToAdd, ...tasks]);
    setIsAddingTask(false);
    setNewTask({
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      category: 'study',
    });
  };

  // Update task status
  const updateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  // Delete task
  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  // Filter tasks based on selected filter
  const filteredTasks =
    selectedFilter === 'all'
      ? tasks
      : tasks.filter((task) => task.status === selectedFilter);

  // Get status icon
  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'missed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="default">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
    }
  };

  // Get category badge
  const getCategoryBadge = (category: TaskCategory) => {
    switch (category) {
      case 'study':
        return <Badge variant="secondary">Study</Badge>;
      case 'assignment':
        return <Badge className="bg-indigo-600">Assignment</Badge>;
      case 'exam':
        return <Badge className="bg-purple-600">Exam</Badge>;
      case 'reading':
        return <Badge className="bg-blue-600">Reading</Badge>;
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
                <Button>
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
                      value={newTask.description}
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
                            priority: value as TaskPriority,
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
                            category: value as TaskCategory,
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
                          <SelectItem value="reading">Reading</SelectItem>
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
                        value={newTask.dueTime}
                        onChange={(e) =>
                          setNewTask({ ...newTask, dueTime: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="task-duration">Duration (mins)</Label>
                      <Input
                        id="task-duration"
                        type="number"
                        min="1"
                        placeholder="Estimated minutes"
                        value={newTask.estimatedMinutes}
                        onChange={(e) =>
                          setNewTask({
                            ...newTask,
                            estimatedMinutes: parseInt(e.target.value),
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
                  <Button onClick={handleAddDetailedTask}>Add Task</Button>
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
          <Button onClick={handleQuickAddTask}>Add</Button>
        </div>

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
                You&oposve completed {completedTasks} of {totalTasks} tasks (
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
                              {task.dueTime}
                            </div>
                          )}
                          {task.estimatedMinutes && (
                            <div className="text-xs text-gray-500">
                              {task.estimatedMinutes} min
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
