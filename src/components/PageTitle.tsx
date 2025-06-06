'use client';

import { getPageTitle } from '@/config/navItems';
import { useSidebarChat } from '@/hooks/useSidebarChat';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

export function PageTitle() {
  const pathname = usePathname();
  const { chats, loading } = useSidebarChat();

  const currentPageTitle = useMemo(() => {
    if (pathname.startsWith('/chat')) {
      if (loading) {
        return 'Loading...';
      }
      const slug = pathname.split('/')[2];
      const chat = chats.find((c) => c.id === slug);
      if (chat) {
        return chat.name || 'Chatbot';
      }
    } else {
      return getPageTitle(pathname);
    }
  }, [chats, loading, pathname]);

  return <h1 className="text-base font-medium">{currentPageTitle}</h1>;
}
