import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-primary" />
          <CardTitle>Application Settings</CardTitle>
        </div>
        <CardDescription>
          Customize your application theme and notification preferences.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Settings options (Theme toggle, Notification preference) will go here.
        </p>
        {/* Settings components will be added later */}
      </CardContent>
    </Card>
  );
}
