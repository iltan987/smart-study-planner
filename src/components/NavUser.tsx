'use client';

import { navUserNavItems } from '@/config/navItems';
import { cn } from '@/lib/utils';
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

const getInitials = (name: string): string => {
  if (!name.trim()) return '';
  const words = name.trim().split(' ').filter(Boolean);
  if (words.length === 0) return '';
  if (words.length === 1) {
    const word = words[0];
    return word.length > 1
      ? word.substring(0, 2).toUpperCase()
      : word.toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

const avatarBackgroundColors = [
  'bg-red-500',
  'bg-green-500',
  'bg-blue-500',
  'bg-yellow-400',
  'bg-indigo-500',
  'bg-purple-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-cyan-500',
  'bg-emerald-500',
  'bg-lime-400',
  'bg-sky-500',
  'bg-pink-500',
  'bg-rose-500',
  'bg-violet-500',
  'bg-fuchsia-500',
  'bg-amber-400',
  'bg-stone-500',
];

const avatarTextColors: { [key: string]: string } = {
  'bg-yellow-400': 'text-yellow-900',
  'bg-lime-400': 'text-lime-900',
  'bg-amber-400': 'text-amber-900',
};

const defaultAvatarTextColor = 'text-white';

export function NavUser() {
  const { data: session, status } = useSession({ required: true });
  const { isMobile, open } = useSidebar();

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
      <SidebarMenuItem>
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
                  <DropdownMenuItem key={item.title} asChild>
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
