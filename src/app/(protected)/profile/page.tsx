import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { UserCircle } from 'lucide-react';

export default function ProfilePage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserCircle className="h-6 w-6 text-primary" />
          <CardTitle>User Profile</CardTitle>
        </div>
        <CardDescription>
          Manage your personal details and educational information.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Profile management forms and details will go here.
        </p>
        {/* Profile form components will be added later */}
      </CardContent>
    </Card>
  );
}
