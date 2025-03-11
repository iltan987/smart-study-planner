'use client';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function Profile() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    education: '',
    studyGoal: '',
    notifications: false,
  });

  return (
    <div className="max-w-2xl mx-auto h-auto p-6 bg-white shadow-md rounded-lg h-screen">
      <h2 className="text-2xl font-semibold mb-4 pb-4">User Profile</h2>

      {/* Name and Email */}
      <div className="space-y-4 mb-4">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          placeholder="John Doe"
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
        />
      </div>

      <div className="space-y-4 mb-4">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="johndoe@example.com"
          value={profile.email}
          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
        />
      </div>

      {/* Education Level */}
      <div className="space-y-4 mb-4">
        <Label htmlFor="education">Education Level</Label>
        <Select
          onValueChange={(value) =>
            setProfile({ ...profile, education: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your faculty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="engineering">Engineering</SelectItem>
            <SelectItem value="medicine">Medicine</SelectItem>
            <SelectItem value="management">Management</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Study Goals */}
      <div className="space-y-4 mb-4">
        <Label htmlFor="studyGoal">Study Goals</Label>
        <Textarea
          id="studyGoal"
          placeholder="I want to improve my study habits..."
          value={profile.studyGoal}
          onChange={(e) =>
            setProfile({ ...profile, studyGoal: e.target.value })
          }
        />
      </div>

      {/* Preferred Learning Style */}
      <div className="space-y-6 mb-4 pb-6">
        <Label>Favorite Hobbies</Label>
        <div className="flex items-center space-x-3">
          <Checkbox id="visual" />
          <Label htmlFor="visual">Exercising</Label>
          <Checkbox id="auditory" />
          <Label htmlFor="auditory">waching movies</Label>
          <Checkbox id="reading" />
          <Label htmlFor="reading">reading books</Label>
          <Checkbox id="kinesthetic" />
          <Label htmlFor="kinesthetic">hangout with friends</Label>
        </div>
      </div>

      {/* Notifications */}
      <div className="flex items-center justify-between mb-6  ">
        <Label htmlFor="notifications">Receive Study Reminders</Label>
        <Switch
          id="notifications"
          checked={profile.notifications}
          onCheckedChange={(value) =>
            setProfile({ ...profile, notifications: value })
          }
        />
      </div>

      {/* Submit Button */}
      <Button className="w-full ">Save Profile</Button>
    </div>
  );
}
