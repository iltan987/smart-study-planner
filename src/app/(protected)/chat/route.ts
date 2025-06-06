import { createChat } from '@/actions/chat.action';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const result = await createChat();
  if (result.success) {
    return NextResponse.redirect(
      new URL(`/chat/${result.data.chatId}`, req.nextUrl.origin)
    );
  }
  return NextResponse.json({ error: 'Failed to create chat' }, { status: 500 });
}
