'use client';

import { logout } from '@/actions/auth/logout.action';
import { getUser } from '@/actions/auth/user.action';
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
import { useEffect, useState } from 'react';
import { NavUser } from './nav-user';
import { ThemeToggle } from './theme-toggle';
import { navigationItems } from '@/config/navigation';

export function Sidebar() {
  const [user, setUser] = useState<{
    name: string;
    email: string;
  } | null>(null);
  const { setOpenMobile } = useSidebar();

  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getUser();
      if (user.success) {
        setUser(user.data);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    setOpenMobile(false);
    logout();
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
            <NavUser user={user} handleLogout={handleLogout} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </SidebarComponent>
  );
}
