'use client';

import type { NavigationItem } from '@/config/navItems';
import { bottomNavItems, navItems } from '@/config/navItems';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarMenuButton, SidebarMenuItem, useSidebar } from './ui/sidebar';

export function SidebarMenuComponent({ position }: { position: 1 | 2 }) {
  return (position === 1 ? navItems : bottomNavItems).map((item, idx) => (
    <SidebarMenuItemComponent key={idx} item={item} />
  ));
}

function SidebarMenuItemComponent({ item }: { item: NavigationItem }) {
  const { setOpenMobile } = useSidebar();
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <SidebarMenuItem onClick={() => setOpenMobile(false)}>
      <SidebarMenuButton
        tooltip={item.title}
        asChild
        isActive={isActive(item.href)}
        className="h-10 text-md  gap-y-4"
      >
        <Link href={item.href}>
          <item.icon />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
