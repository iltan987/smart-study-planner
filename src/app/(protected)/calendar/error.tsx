'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle, Info, ShieldOff } from 'lucide-react';
import { useEffect } from 'react';

export default function CalendarErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  let title = 'Oops! Something went wrong.';
  let description =
    "We couldn't load your calendar events due to an unexpected error. Please try again, or contact support if the problem persists.";
  let Icon = AlertTriangle;

  // Show specific messages for known error types
  if (error?.name === 'ValidationException') {
    description =
      error.message ||
      'There was a problem with your input. Please check and try again.';
    Icon = Info;
  } else if (
    error?.message === 'Unauthorized' ||
    error?.name === 'Unauthorized'
  ) {
    title = 'Unauthorized';
    description =
      'You are not authorized to view this page. Please log in and try again.';
    Icon = ShieldOff;
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8 max-w-md w-full flex flex-col items-center">
        <Icon className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-semibold mb-2 text-center">{title}</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-center">
          {description}
        </p>
        {/* Show error details for debugging */}
        {process.env.NODE_ENV === 'development' && (
          <pre className="text-xs text-gray-400 mb-4 break-all">
            {JSON.stringify(error, null, 2)}
          </pre>
        )}
        {process.env.NODE_ENV === 'development' && error?.digest && (
          <pre className="text-xs text-gray-400 mb-4 break-all">
            {error.digest}
          </pre>
        )}
        <Button onClick={() => reset()} className="w-full">
          Try Again
        </Button>
      </div>
    </div>
  );
}
