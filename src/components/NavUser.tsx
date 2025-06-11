'use client';

import { navUserNavItems } from '@/config/navItems';
import { cn } from '@/lib/utils';
import {
  avatarBackgroundColors,
  avatarTextColors,
  defaultAvatarTextColor,
  getInitials,
} from '@/utils/avatar.util';
import { LogOutIcon, MoreVerticalIcon } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useMemo } from 'react';
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
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from './ui/sidebar';
import { Skeleton } from './ui/skeleton';

export function NavUser() {
  const { data: session, status } = useSession({ required: true });
  const { isMobile, open, setOpenMobile } = useSidebar();

  const { initials, selectedBgColor, selectedTextColor } = useMemo(() => {
    if (!session?.user.name)
      return {
        selectedBgColor: 'bg-gray-200',
        selectedTextColor: 'text-gray-700',
      };

    const initials = getInitials(session.user.name);

    const charCodeSum = session.user.name
      .split('')
      .reduce((sum, char) => sum + char.charCodeAt(0), 0);

    const selectedBgColor =
      avatarBackgroundColors[charCodeSum % avatarBackgroundColors.length];

    const selectedTextColor =
      avatarTextColors[selectedBgColor] || defaultAvatarTextColor;
    return {
      initials,
      selectedBgColor,
      selectedTextColor,
    };
  }, [session?.user.name]);

  if (status === 'loading') {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Skeleton className="h-8 w-8 rounded-lg" />
                {open && (
                  <>
                    <div className="grid flex-1 leading-tight">
                      <Skeleton className="h-3.5 w-full" />
                      <Skeleton className="mt-1 h-3 w-full" />
                    </div>
                    <Skeleton className="ml-auto h-4 w-4 rounded-full" />
                  </>
                )}
              </SidebarMenuButton>
            </DropdownMenuTrigger>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const handleSignOut = () => {
    signOut();
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem onClick={() => setOpenMobile(false)}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={session.user.image ?? undefined}
                  alt={session.user.name}
                />
                <AvatarFallback
                  className={cn(
                    'rounded-lg',
                    selectedBgColor,
                    selectedTextColor
                  )}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {session.user.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {session.user.email}
                </span>
              </div>
              <MoreVerticalIcon className="ml-auto size-4" />
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
                  <AvatarImage
                    src={session.user.image ?? undefined}
                    alt={session.user.name}
                  />
                  <AvatarFallback
                    className={cn(
                      'rounded-lg',
                      selectedBgColor,
                      selectedTextColor
                    )}
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {session.user.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {session.user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {navUserNavItems.map((item) => {
                return (
                  <DropdownMenuItem
                    key={item.title}
                    asChild
                    className="gap-y-3"
                  >
                    <Link href={item.href}>
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} variant="destructive">
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
