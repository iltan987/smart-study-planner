import { HeaderCard } from '@/components/dashboard/HeaderCard';
import { TodaysCalendar } from '@/components/dashboard/TodaysCalendar';
import { UpcomingTodos } from '@/components/dashboard/UpcomingTodos';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/lib/auth';
import { CalendarDays, MessageSquare, PlusCircle, Zap } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) redirect('/login');

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 animate-fadeIn">
      <HeaderCard userName={session.user.name} />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <UpcomingTodos />

        <TodaysCalendar />

        {/* Quick Actions Card */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">
              Quick Actions
            </CardTitle>
            <Zap className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3 pt-4">
            <Button asChild size="lg" className="w-full">
              <Link href="/todos?action=add">
                <PlusCircle className="mr-2 h-5 w-5" /> Add New Todo
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link href="/calendar?action=add">
                <CalendarDays className="mr-2 h-5 w-5" /> Add New Event
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="w-full">
              <Link href="/chat">
                <MessageSquare className="mr-2 h-5 w-5" /> Chat with AI Pal
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
