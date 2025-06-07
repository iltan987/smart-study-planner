import type { Todo } from '@prisma/client';
import { format } from 'date-fns';
import { CheckCircle, ListChecks } from 'lucide-react';

export function DashboardTodoItem({ todo }: { todo: Todo }) {
  const displayDate = todo.dueTime
    ? format(todo.dueTime, 'p')
    : todo.date
      ? 'All-day'
      : 'No due date';

  const isCompleted = todo.status === 'COMPLETED';

  return (
    <div
      className={`flex items-center justify-between p-3 hover:bg-muted/50 rounded-md transition-colors ${
        isCompleted ? 'opacity-70' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        {isCompleted ? (
          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
        ) : (
          <ListChecks className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        )}
        <div>
          <p
            className={`text-sm font-medium leading-none group-hover:underline ${
              isCompleted ? 'line-through text-muted-foreground' : ''
            }`}
          >
            {todo.title}
          </p>
          {todo.description && (
            <p
              className={`text-xs text-muted-foreground truncate max-w-xs ${
                isCompleted ? 'line-through' : ''
              }`}
            >
              {todo.description}
            </p>
          )}
        </div>
      </div>
      <div
        className={`text-xs text-muted-foreground ml-4 whitespace-nowrap ${
          isCompleted ? 'line-through' : ''
        }`}
      >
        {displayDate}
      </div>
    </div>
  );
}
