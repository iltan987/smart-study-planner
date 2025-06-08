import { Skeleton } from '@/components/ui/skeleton';
import type { Todo } from '@prisma/client';
import { format } from 'date-fns';
import { CheckCircle, ListChecks, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export function DashboardTodoItem({
  todo,
}: {
  todo: Pick<Todo, 'date' | 'description' | 'dueTime' | 'status' | 'title'>;
}) {
  const [clientDisplayDate, setClientDisplayDate] = useState<string | null>(
    null
  );

  useEffect(() => {
    const calculatedDisplayDate = todo.dueTime
      ? format(todo.dueTime, 'p')
      : todo.date
        ? format(todo.date, 'MMM d')
        : 'No due date';
    setClientDisplayDate(calculatedDisplayDate);
  }, [todo.dueTime, todo.date]);

  const isCompleted = todo.status === 'COMPLETED';
  const isMissed = todo.status === 'MISSED';

  return (
    <div
      className={`flex items-center justify-between p-3 hover:bg-muted/50 rounded-md transition-colors ${
        isCompleted || isMissed ? 'opacity-70' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        {isCompleted ? (
          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
        ) : isMissed ? (
          <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
        ) : (
          <ListChecks className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        )}
        <div>
          <p
            className={`text-sm font-medium leading-none group-hover:underline ${
              isCompleted
                ? 'line-through text-muted-foreground'
                : isMissed
                  ? 'text-red-500'
                  : ''
            }`}
          >
            {todo.title}
          </p>
          {todo.description && (
            <p
              className={`text-xs text-muted-foreground truncate max-w-xs ${
                isCompleted ? 'line-through' : isMissed ? 'text-red-500' : ''
              }`}
            >
              {todo.description}
            </p>
          )}
        </div>
      </div>
      <div
        className={`text-xs text-muted-foreground ml-4 whitespace-nowrap ${
          isCompleted ? 'line-through' : isMissed ? 'text-red-500' : ''
        }`}
      >
        {clientDisplayDate === null ? (
          <Skeleton className="h-4 w-[60px]" />
        ) : (
          clientDisplayDate
        )}
      </div>
    </div>
  );
}
