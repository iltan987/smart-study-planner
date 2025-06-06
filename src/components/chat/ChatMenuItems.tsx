'use client';

import { useSidebarChat } from '@/hooks/useSidebarChat';
import { Button } from '../ui/button';
import { ChatChannelMenuItem } from './ChatMenuItem';
import { ChatChannelsSkeleton } from './ChatMenuItemSkeleton';

export function Chats() {
  const { chats: channels, loading, handleCreateChat } = useSidebarChat();

  if (loading) {
    return <ChatChannelsSkeleton />;
  }

  if (channels.length === 0) {
    return (
      <div className="px-3 py-2 text-muted-foreground text-sm">
        You have no channels yet.{' '}
        <Button
          onClick={() => handleCreateChat()}
          variant="link"
          size="sm"
          className="p-0"
        >
          Create one!
        </Button>
      </div>
    );
  }
  return channels
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map((channel) => (
      <ChatChannelMenuItem
        key={channel.id}
        channelId={channel.id}
        title={channel.name}
        href={`/chat/${channel.id}`}
      />
    ));
}
