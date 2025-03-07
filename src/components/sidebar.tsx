'use client';

import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavUser } from './nav-user';
import { ThemeToggle } from './theme-toggle';
import { navigationItems } from '@/config/navigation';
import { toast } from 'sonner';
import { RESPONSE_MESSAGES_SUCCESS } from '@/constants/response-messages';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function Sidebar() {
  const { setOpenMobile } = useSidebar();
  const { push } = useRouter();
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  const handleLogout = async () => {
    setOpenMobile(false);
    await signOut({ redirect: false });
    toast.success(RESPONSE_MESSAGES_SUCCESS.LOGOUT_SUCCESS);
    push('/login');
  };

  return (
    <SidebarComponent variant="floating" collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem
                  key={item.title}
                  onClick={() => setOpenMobile(false)}
                >
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <ThemeToggle />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <NavUser handleLogout={handleLogout} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </SidebarComponent>
  );
}
