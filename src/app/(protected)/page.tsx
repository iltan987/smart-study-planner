import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to your Smart Study Planner!</CardTitle>
          <CardDescription>
            This is your main dashboard. Manage your tasks, events, and settings
            from here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Use the navigation on the left (or top-left on mobile) to access
            different sections of the application.
          </p>
          {/* More dashboard content will go here later */}
        </CardContent>
      </Card>
      {/* Example of more cards/content */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Todos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No todos scheduled for today.
            </p>
            {/* Todo list preview will go here */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No events scheduled for today.
            </p>
            {/* Calendar preview will go here */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {/* Will add buttons for quick actions later */}
            <p className="text-sm text-muted-foreground">
              AI Chat, Add Todo, Add Event...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
