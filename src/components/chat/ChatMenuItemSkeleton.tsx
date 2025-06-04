'use client';

import { useEffect, useState } from 'react';
import { SidebarMenuItem, SidebarMenuSkeleton } from '../ui/sidebar';

export function ChatChannelsSkeleton() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return Array.from({ length: 3 }).map((_, index) => (
    <SidebarMenuItem key={index}>
      <SidebarMenuSkeleton showIcon />
    </SidebarMenuItem>
  ));
}
