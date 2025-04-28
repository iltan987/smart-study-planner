'use client';

import { navigationItems } from '@/config/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from './ui/sidebar';

export function Sidebar() {
  const { setOpenMobile } = useSidebar();
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <SidebarComponent variant="floating" collapsible="icon">
      <SidebarContent className="flex flex-col justify-between h-full">
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
        <SidebarFooter>
          <div className="flex items-center gap-3 p-4">
            <Image
              src="/images/logo.png"
              alt="SSP"
              width={24}
              height={24}
              className="rounded-full"
            />
            <span className="text-sm font-medium">Welcome to SSP</span>
          </div>
        </SidebarFooter>
      </SidebarContent>
    </SidebarComponent>
  );
}
