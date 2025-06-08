'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { ScrollArea } from './ui/scroll-area';

export function MainContent({ children }: { children: ReactNode }) {
  const isChat = usePathname().includes('/chat');
  return isChat ? (
    <main className="flex-1 gap-4 md:gap-6 overflow-hidden">{children}</main>
  ) : (
    <main className="flex-1 gap-4 md:gap-6">
      <ScrollArea>{children}</ScrollArea>
    </main>
  );
}
