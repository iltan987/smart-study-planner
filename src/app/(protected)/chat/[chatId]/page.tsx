import { auth } from '@/lib/auth';
import {
  getChatRatingsFromRedis,
  getMessagesFromRedisChat,
} from '@/utils/chat-messages.util';
import { checkIfChatExists } from '@/utils/chat.util';
import { redirect } from 'next/navigation';
import { ChatPageClient } from './ChatPageClient';

interface ChatPageProps {
  params: Promise<{
    chatId: string;
  }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const session = await auth();
  if (!session) {
    redirect('/login');
  }

  const { chatId } = await params;

  const isExists = await checkIfChatExists(chatId);

  if (!isExists) {
    redirect('/chat');
  }

  const [initialMessages, initialRatings] = await Promise.all([
    getMessagesFromRedisChat(chatId),
    getChatRatingsFromRedis(chatId),
  ]);

  return (
    <ChatPageClient
      chatId={chatId}
      initialMessages={initialMessages}
      initialRatings={initialRatings}
    />
  );
}
