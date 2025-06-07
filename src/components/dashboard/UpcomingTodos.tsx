'use client';

import { getTodos } from '@/actions/todos.action';
import type { Todo } from '@prisma/client';
import { endOfDay, startOfDay } from 'date-fns';
import { ListChecks, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { DashboardTodoItem } from './DashboardTodoItem';
import { UpcomingTodosSkeleton } from './UpcomingTodosSkeleton';

export function UpcomingTodos() {
  const [upcomingTodos, setUpcomingTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const now = new Date();
      const date = {
        year: now.getFullYear(),
        monthIndex: now.getMonth(),
        date: now.getDate(),
      };
      const result = await getTodos({
        date,
        start: startOfDay(now),
        end: endOfDay(now),
      });
      if (result.success) {
        setUpcomingTodos(result.data);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return <UpcomingTodosSkeleton />;
  }

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Upcoming Todos</CardTitle>
        <ListChecks className="h-6 w-6 text-primary" />
      </CardHeader>
      <CardContent>
        {upcomingTodos.length > 0 ? (
          <div className="space-y-1">
            {upcomingTodos.map((todo) => (
              <DashboardTodoItem key={todo.id} todo={todo} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No upcoming todos for today or tomorrow. Way to go!
          </p>
        )}
        <Button asChild variant="outline" className="w-full mt-4">
          <Link href="/todos">
            <PlusCircle className="mr-2 h-4 w-4" /> Add or View All Todos
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
