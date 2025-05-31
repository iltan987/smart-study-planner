import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';

export default function ChatPage() {
  return (
    <div className="flex flex-col h-full">
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-primary" />
            <CardTitle>AI Chat Assistant</CardTitle>
          </div>
          <CardDescription>
            Interact with the Smart Study Planner AI to manage your tasks and
            schedule.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center">
          <p className="text-muted-foreground">
            AI Chat interface will be implemented here.
          </p>
          {/* AI Chat components will go here */}
        </CardContent>
      </Card>
    </div>
  );
}
