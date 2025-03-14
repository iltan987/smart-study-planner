import 'server-only';
import { auth } from '@/lib/auth';
import type { Session } from 'next-auth';

export async function withAuth<TResult>(
  fn: (session: Session | null) => TResult
) {
  const session = await auth();
  return fn(session);
}
