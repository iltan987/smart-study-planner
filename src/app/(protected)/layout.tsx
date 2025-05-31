import { AppLayout } from '@/components/AppLayout';
import { SessionProvider } from 'next-auth/react';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AppLayout>{children}</AppLayout>
    </SessionProvider>
  );
}
