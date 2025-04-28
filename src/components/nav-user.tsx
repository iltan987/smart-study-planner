'use client';

import { LogOut, User } from 'lucide-react';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { SidebarMenuButton, useSidebar } from './ui/sidebar';
import { Skeleton } from './ui/skeleton';

function getInitials(name: string): string {
  if (!name) return '';

  // Split the name into parts and filter out empty strings
  const parts = name.split(' ').filter((part) => part.length > 0);

  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  // Take first name and last name
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function NavUser({ handleLogout }: { handleLogout: () => void }) {
  const { isMobile } = useSidebar();
  const { data, status } = useSession();
  const isLoading = status === 'loading';

  const user = data?.user || null;
  const initials = user?.name ? getInitials(user.name) : '';

  if (isLoading) {
    return (
      <SidebarMenuButton size="lg">
        <Skeleton className="h-8 w-8 rounded-lg" />
        {/* <div className="grid flex-1 gap-1 text-left">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-32" />
        </div> */}
        <Skeleton className="ml-auto h-4 w-4" />
      </SidebarMenuButton>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Avatar className="h-10 w-10 rounded-full">
            {user?.image && <AvatarImage src={user.image} alt="User profile" />}
            <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
          </Avatar>
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        side={isMobile ? 'bottom' : 'right'}
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user?.name || ''}</span>
              <span className="truncate text-xs">{user?.email || ''}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} variant="destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
