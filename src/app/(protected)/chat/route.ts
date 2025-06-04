import { createChat } from '@/actions/chat.action';
import { NextResponse } from 'next/server';

export async function GET() {
  const result = await createChat();
  if (result.success) {
    return NextResponse.redirect(`/chat/${result.data.chatId}`);
  }
  return NextResponse.json({ error: 'Failed to create chat' }, { status: 500 });
}
