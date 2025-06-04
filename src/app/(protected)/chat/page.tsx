import { createChat } from '@/actions/chat.action';
import { redirect } from 'next/navigation';

export default async function Page() {
  const id = await createChat();
  if (id.success) redirect(`/chat/${id.data.chatId}`);
}
