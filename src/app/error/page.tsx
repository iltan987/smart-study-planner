'use client';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function ErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full overflow-hidden text-center">
      <Image
        src="/images/404.svg"
        alt="Error"
        width={180}
        height={180}
        className="mb-4"
      />
      <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
      <p className="text-lg text-muted-foreground mb-6">
        We couldn&apos;t process your request. Please try again later.
      </p>
      <Button onClick={() => window.location.reload()}>Reload Page</Button>
    </div>
  );
}
