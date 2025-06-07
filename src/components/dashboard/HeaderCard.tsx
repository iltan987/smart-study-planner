'use client';

import { format, getDayOfYear } from 'date-fns';
import { useEffect, useState } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { HeaderSkeleton } from './HeaderSkeleton';

const welcomeMessages: string[] = [
  'Ready to conquer your studies?',
  "Let's make today productive!",
  'Time to dive into learning!',
  'Seize the day and ace those goals!',
  'Your academic journey continues!',
  'Unlock your potential today!',
  "Every effort counts. Let's go!",
  'Focus, learn, and grow.',
  'Today is a new opportunity to learn.',
  'Believe in yourself and your abilities.',
  "Let's tackle those tasks!",
  "Knowledge is power. Let's get some!",
  'Stay curious and keep learning.',
  'Your hard work will pay off.',
  'Make today amazing!',
  'Ready for another day of success?',
  "Let's get started on your goals!",
  'Embrace the learning process.',
  "You've got this!",
  'Time to shine and learn something new!',
  'The expert in anything was once a beginner.',
  'Push yourself, because no one else is going to do it for you.',
  'Your future is created by what you do today, not tomorrow.',
  'The beautiful thing about learning is that no one can take it away from you.',
  'Strive for progress, not perfection.',
  'Success is the sum of small efforts, repeated day in and day out.',
  'The only way to do great work is to love what you do.',
  "Don't watch the clock; do what it does. Keep going.",
  "The harder you work for something, the greater you'll feel when you achieve it.",
  'Dream bigger. Do bigger.',
  'Invest in your knowledge bank.',
  'Learning is a treasure that will follow its owner everywhere.',
  'The journey of a thousand miles begins with a single step.',
  'Keep your eyes on the prize.',
  "Turn your can'ts into cans and your dreams into plans.",
  'Every day is a chance to learn.',
  'Be a lifelong learner.',
  'Challenge yourself to learn something new today.',
  'The best way to predict the future is to create it.',
  'Let your curiosity lead the way.',
];

function getGreeting(date: Date): string {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) {
    return 'Good Morning';
  } else if (hour >= 12 && hour < 17) {
    return 'Good Afternoon';
  } else if (hour >= 17 && hour < 22) {
    return 'Good Evening';
  } else {
    return 'Good Night';
  }
}

export function HeaderCard({ userName }: { userName: string }) {
  const [now, setNow] = useState<Date>();
  useEffect(() => {
    setNow(new Date());
  }, []);

  if (!now) {
    return <HeaderSkeleton />;
  }

  const greeting = getGreeting(now);
  const dayOfYear = getDayOfYear(now);

  // Calculate a user-specific offset from the userName
  const userOffset = userName
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const selectedMessageIndex =
    (dayOfYear - 1 + userOffset) % welcomeMessages.length;
  const selectedMessage = welcomeMessages[selectedMessageIndex];
  const firstName = userName.split(' ')[0] || 'Student';

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight">
          {greeting}, {firstName}! {selectedMessage}
        </CardTitle>
        <CardDescription className="text-md text-muted-foreground">
          Here&apos;s your academic overview for today,{' '}
          {format(now, 'MMMM d, yyyy')}. Let&apos;s make it a productive one!
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
