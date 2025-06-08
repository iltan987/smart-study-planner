'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard Page Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] gap-4 p-4 text-center">
      <AlertTriangle className="h-16 w-16 text-destructive" />
      <h2 className="text-2xl font-semibold text-destructive">
        Oops! Something went wrong.
      </h2>
      <p className="text-muted-foreground max-w-md">
        We couldn&apos;t load your dashboard information at the moment. This
        might be a temporary issue.
      </p>
      {process.env.NODE_ENV === 'development' && error?.message && (
        <pre className="mt-2 text-xs text-muted-foreground bg-muted p-2 rounded-md whitespace-pre-wrap">
          Error: {error.message}
        </pre>
      )}
      <Button onClick={() => reset()} variant="default" size="lg">
        Try Again
      </Button>
    </div>
  );
}
