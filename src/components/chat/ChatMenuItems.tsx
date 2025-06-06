'use client';

import { useSidebarChat } from '@/hooks/useSidebarChat';
import Link from 'next/link';
import { ChatChannelMenuItem } from './ChatMenuItem';
import { ChatChannelsSkeleton } from './ChatMenuItemSkeleton';

export function Chats() {
  const { chats: channels, loading } = useSidebarChat();

  if (loading) {
    return <ChatChannelsSkeleton />;
  }

  if (channels.length === 0) {
    return (
      <div className="px-3 py-2 text-muted-foreground text-sm">
        You have no channels yet.{' '}
        <Link href="/chat" className="text-primary hover:underline">
          Create one
        </Link>{' '}
        to start chatting!
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
