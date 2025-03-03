'use client';

import { logout } from '@/actions/auth/logout.action';
import { useSession } from '@/providers/session-provider';
import { Button } from '@/components/ui/button';
import { redirect } from 'next/navigation';

export function LogoutButton() {
  const { update } = useSession();

  const handleLogout = async () => {
    await logout();
    await update();
    redirect('/login');
  };

  return (
    <Button onClick={handleLogout} variant="destructive">
      Logout
    </Button>
  );
}
