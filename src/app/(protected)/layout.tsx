import { AppLayout } from '@/components/AppLayout';
import { SessionProvider } from 'next-auth/react';
import type { ReactNode } from 'react';

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SessionProvider>
      <AppLayout>{children}</AppLayout>
    </SessionProvider>
  );
}
