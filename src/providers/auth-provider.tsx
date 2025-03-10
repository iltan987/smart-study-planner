'use client';

import { SessionProvider } from 'next-auth/react';

export function AuthProvider({
  children,
  ...props
}: React.ComponentProps<typeof SessionProvider>) {
  return <SessionProvider {...props}>{children}</SessionProvider>;
}
