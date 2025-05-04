'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { UserProfileSchema } from '@/schemas/user-profile.schema';

export default function SettingsPageContent({
  userProfile,
}: {
  userProfile: UserProfileSchema;
}) {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-10">
      {/* General Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            General Information
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Add your information for better planning
          </p>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-6 gap-6">
            <div className="col-span-6 sm:col-span-3 space-y-2">
              <Label htmlFor="first-name">First Name</Label>
              <Input
                id="first-name"
                name="first-name"
                placeholder={userProfile.name?.split(' ')[0] || 'First name'}
                required
              />
            </div>
            <div className="col-span-6 sm:col-span-3 space-y-2">
              <Label htmlFor="last-name">Last Name</Label>
              <Input
                id="last-name"
                name="last-name"
                placeholder={userProfile.name?.split(' ')[1] || 'Last name'}
                required
              />
            </div>
            <div className="col-span-6 sm:col-span-3 space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select defaultValue={userProfile.profile.gender?.toLowerCase()}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-6 sm:col-span-3 space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="turkish">Turkish</SelectItem>
                  <SelectItem value="persian">Persian</SelectItem>
                  <SelectItem value="french">French</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-6 sm:col-span-3 space-y-2">
              <Label htmlFor="birthday">Birthday</Label>
              <Input
                id="birthday"
                type="date"
                defaultValue={userProfile.profile.dob?.toString()}
              />
            </div>
            <div className="col-span-6 sm:col-span-3 space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder={userProfile.email} />
            </div>
            <div className="col-span-6">
              <Button type="submit" className="w-full sm:w-auto">
                Save All
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* School Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            School Information
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Add your school information for better planning
          </p>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-6 gap-6">
            <div className="col-span-6 sm:col-span-3 space-y-2">
              <Label htmlFor="school-name">School Name</Label>
              <Input
                id="school-name"
                placeholder="Cyprus International University"
                required
              />
            </div>
            <div className="col-span-6 sm:col-span-3 space-y-2">
              <Label htmlFor="degree">Degree</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select degree" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bachelor">Bachelor</SelectItem>
                  <SelectItem value="master">Master</SelectItem>
                  <SelectItem value="phd">PhD</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-6 sm:col-span-3 space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input id="department" defaultValue="Engineering" required />
            </div>
            <div className="col-span-6 sm:col-span-3 space-y-2">
              <Label htmlFor="starting-date">Starting Date</Label>
              <Input id="starting-date" type="date" />
            </div>
            <div className="col-span-6 sm:col-span-3 space-y-2">
              <Label htmlFor="gpa">GPA</Label>
              <Input
                id="gpa"
                type="number"
                min="0"
                max="4"
                placeholder="3.9"
                required
              />
            </div>
            <div className="col-span-6">
              <Button type="submit" className="w-full sm:w-auto">
                Save All
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Change Password
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Update your password for security
          </p>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-6 gap-6">
            <div className="col-span-6 sm:col-span-3 space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" required />
            </div>
            <div className="col-span-6 sm:col-span-3 space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" required />
            </div>
            <div className="col-span-6 sm:col-span-3 space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input id="confirm-password" type="password" required />
            </div>
            <div className="col-span-6">
              <Button type="submit" className="w-full sm:w-auto">
                Update Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Notifications</CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage how you receive notifications
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">App Notifications</h4>
              <p className="text-sm text-muted-foreground">
                Receive important updates and alerts
              </p>
            </div>
            <Switch id="notifications" defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
