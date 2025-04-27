import { RESPONSE_MESSAGES_SUCCESS } from '@/constants/response-messages';
import { Avatar } from '@radix-ui/react-avatar';
import { signOut } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { NavUser } from './nav-user';
import { ThemeToggle } from './theme-toggle';
import { SidebarTrigger, useSidebar } from './ui/sidebar';

export function Navbar() {
  // const pathname = usePathname();
  const { push } = useRouter();
  const { setOpenMobile } = useSidebar();

  const handleLogout = async () => {
    setOpenMobile(false);
    await signOut({ redirect: false });
    toast.success(RESPONSE_MESSAGES_SUCCESS.LOGOUT_SUCCESS);
    push('/login');
  };

  // no need anymore
  // const getTitle = (path: string) => {
  //   const item = navigationItems.find((item) => item.url === path);
  //   if (item) {
  //     return item.title;
  //   } else {
  //     const userItem = userNavigationItems.find((item) => item.url === path);
  //     if (userItem) {
  //       return userItem.title;
  //     }
  //   }
  //   return 'Not Found';
  // };

  return (
    <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-4 px-4">
        <SidebarTrigger />
        <Avatar className="h-10 w-10 rounded-full">
          <Image src="/images/logo.png" alt="Logo" width={40} height={40} />
        </Avatar>
        <h1 className="text-lg font-semibold">Smart Study Planner</h1>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <NavUser handleLogout={handleLogout} />
        </div>
      </div>
    </div>
  );
}
