'use client';

import { useSidebarChat } from '@/hooks/useSidebarChat';
import { Plus } from 'lucide-react';
import { SidebarMenuAction } from '../ui/sidebar';

export function CreateChatSidebarMenuAction() {
  const { handleCreateChat: handleCreateChannel, loading } = useSidebarChat();

  return (
    <SidebarMenuAction onClick={() => handleCreateChannel()} disabled={loading}>
      <Plus /> <span className="sr-only">Add Project</span>
    </SidebarMenuAction>
  );
}
