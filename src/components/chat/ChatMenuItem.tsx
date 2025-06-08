'use client';

import { useSidebarChat } from '@/hooks/useSidebarChat';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuSubItem,
  useSidebar,
} from '../ui/sidebar';

export function ChatChannelMenuItem({
  channelId,
  title,
  href,
}: {
  channelId: string;
  title: string;
  href: string;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { setOpenMobile, isMobile } = useSidebar();
  const { openDeleteDialog, openRenameDialog } = useSidebarChat();
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <SidebarMenuSubItem
        onClick={() => {
          if (isMobile) setOpenMobile(false);
        }}
      >
        <SidebarMenuButton isActive={isActive(href)} asChild>
          <Link href={href}>{title}</Link>
        </SidebarMenuButton>
        <SidebarMenuAction>
          <DropdownMenuTrigger asChild>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
        </SidebarMenuAction>
      </SidebarMenuSubItem>
      <DropdownMenuContent
        side={isMobile ? 'bottom' : 'right'}
        align={isMobile ? 'end' : 'start'}
      >
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => {
            openRenameDialog(channelId, title);
          }}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer text-destructive"
          variant="destructive"
          onClick={() => {
            openDeleteDialog(channelId, title);
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
