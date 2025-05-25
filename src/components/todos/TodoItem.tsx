import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { formatUtcToLocalTime } from '@/utils/client-date.util';
import type { Todo } from '@prisma/client';
import { TodoCategory, TodoPriority, TodoStatus } from '@prisma/client';
import {
  AlertTriangle,
  CalendarIcon,
  CheckCircle2,
  Circle,
  Clock,
  Loader2,
  MoreVertical,
  Tag,
  Trash2,
  XCircle,
  Zap,
} from 'lucide-react';

interface TodoItemProps {
  todo: Todo;
  userTimezone: string;
  onStatusChange: (id: string, status: TodoStatus) => void;
  onDelete: (id: string) => void;
  isAdding?: boolean;
  isUpdatingStatus?: boolean;
  isDeleting?: boolean;
}

const priorityColors: Record<TodoPriority, string> = {
  [TodoPriority.HIGH]: 'bg-red-500 hover:bg-red-600 text-white',
  [TodoPriority.MEDIUM]: 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900',
  [TodoPriority.LOW]: 'bg-green-500 hover:bg-green-600 text-white',
};

const categoryColors: Record<TodoCategory, string> = {
  [TodoCategory.STUDY]: 'bg-blue-100 text-blue-700',
  [TodoCategory.ASSIGNMENT]: 'bg-purple-100 text-purple-700',
  [TodoCategory.EXAM]: 'bg-pink-100 text-pink-700',
  [TodoCategory.WORK]: 'bg-indigo-100 text-indigo-700',
  [TodoCategory.GYM]: 'bg-teal-100 text-teal-700',
  [TodoCategory.OTHER]: 'bg-gray-100 text-gray-700',
};

// Get status icon
const getStatusIcon = (status?: TodoStatus | null) => {
  switch (status) {
    case 'COMPLETED':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case 'MISSED':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'PENDING':
      return <Circle className="h-5 w-5 text-yellow-500" />;
    default:
      return <Circle className="h-5 w-5 text-gray-400" />;
  }
};

export function TodoItem({
  todo,
  userTimezone,
  onStatusChange,
  onDelete,
  isAdding,
  isUpdatingStatus,
  isDeleting,
}: TodoItemProps) {
  const localTime = formatUtcToLocalTime(todo.dueTime, userTimezone);

  const handleCheckboxChange = (checked: boolean | 'indeterminate') => {
    if (typeof checked === 'boolean') {
      onStatusChange(
        todo.id,
        checked ? TodoStatus.COMPLETED : TodoStatus.PENDING
      );
    }
  };

  const isDisabled = isAdding || isUpdatingStatus || isDeleting; // Disable interactions during optimistic operations

  let cardClasses =
    'mb-3 duration-300 ease-in-out hover:shadow-md transition-all';
  if (isAdding)
    cardClasses += ' opacity-50 border-dashed border-primary animate-pulse';
  if (isUpdatingStatus) cardClasses += ' opacity-70 animate-pulse';
  if (isDeleting)
    cardClasses +=
      ' opacity-40 bg-destructive/10 border-destructive/30 line-through';

  return (
    <Card className={cn(cardClasses)}>
      <CardContent className="p-4 flex items-start gap-3">
        {isAdding ? (
          <Loader2 className="h-5 w-5 mt-1 text-primary animate-spin flex-shrink-0" />
        ) : (
          <button
            className="mt-1 flex-shrink-0"
            onClick={() => {
              handleCheckboxChange(todo.status === 'PENDING');
            }}
            disabled={isDisabled}
            aria-label={`Mark ${todo.title} as ${
              todo.status === TodoStatus.COMPLETED ? 'pending' : 'completed'
            }`}
          >
            {getStatusIcon(todo.status)}
          </button>
        )}
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <h3
              className={cn(
                'font-semibold text-base leading-tight',
                todo.status === TodoStatus.COMPLETED &&
                  !isDeleting &&
                  'line-through text-muted-foreground',
                isDeleting && 'text-destructive/80'
              )}
            >
              {todo.title}
            </h3>
            {!isAdding && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0 -mr-2 -mt-1"
                    disabled={isDisabled}
                  >
                    {isUpdatingStatus || isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MoreVertical className="h-4 w-4" />
                    )}
                    <span className="sr-only">More options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => onStatusChange(todo.id, TodoStatus.PENDING)}
                    disabled={todo.status === TodoStatus.PENDING || isDisabled}
                  >
                    Mark as Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      onStatusChange(todo.id, TodoStatus.COMPLETED)
                    }
                    disabled={
                      todo.status === TodoStatus.COMPLETED || isDisabled
                    }
                  >
                    Mark as Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onStatusChange(todo.id, TodoStatus.MISSED)}
                    disabled={todo.status === TodoStatus.MISSED || isDisabled}
                  >
                    Mark as Missed
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(todo.id)}
                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                    disabled={isDisabled}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {todo.description && (
            <p
              className={cn(
                'text-sm text-muted-foreground mt-1',
                todo.status === TodoStatus.COMPLETED &&
                  !isDeleting &&
                  'line-through',
                isDeleting && 'text-destructive/70'
              )}
            >
              {todo.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-2">
            {localTime && !isAdding && (
              <span className="flex items-center">
                <Clock className="h-3 w-3 mr-1" /> {localTime}
              </span>
            )}
            {todo.duration && !isAdding && (
              <span className="flex items-center">
                <CalendarIcon className="h-3 w-3 mr-1" /> {todo.duration} min
              </span>
            )}
            {!isAdding && (
              <Badge
                variant="outline"
                className={cn(
                  'text-xs font-normal',
                  priorityColors[todo.priority]
                )}
              >
                <Zap className="h-3 w-3 mr-1" />
                {todo.priority.charAt(0) + todo.priority.slice(1).toLowerCase()}
              </Badge>
            )}
            {!isAdding && (
              <Badge
                variant="outline"
                className={cn(
                  'text-xs font-normal',
                  categoryColors[todo.category]
                )}
              >
                <Tag className="h-3 w-3 mr-1" />
                {todo.category.charAt(0) + todo.category.slice(1).toLowerCase()}
              </Badge>
            )}
            {todo.status !== TodoStatus.COMPLETED &&
              todo.status !== TodoStatus.PENDING &&
              !isAdding && (
                <Badge
                  variant={
                    todo.status === TodoStatus.MISSED && !isDeleting
                      ? 'destructive'
                      : 'outline'
                  }
                  className="text-xs font-normal"
                >
                  {todo.status.charAt(0) + todo.status.slice(1).toLowerCase()}
                </Badge>
              )}
            {isDeleting && (
              <Badge variant="destructive" className="font-normal">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Deleting...
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
