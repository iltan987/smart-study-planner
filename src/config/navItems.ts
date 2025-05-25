import type { LucideIcon } from 'lucide-react';
import {
  Bot,
  CalendarDays,
  Home,
  ListChecks,
  Settings,
  UserCircle,
} from 'lucide-react';

export type NavigationItem = {
  href: string;
  title: string;
  icon: LucideIcon;
};

export const navItems: NavigationItem[] = [
  {
    href: '/',
    title: 'Dashboard',
    icon: Home,
  },
  {
    href: '/todos',
    title: 'Todos',
    icon: ListChecks,
  },
  {
    href: '/calendar',
    title: 'Calendar',
    icon: CalendarDays,
  },
  {
    href: '/chatbot',
    title: 'AI Chat',
    icon: Bot,
  },
];

export const bottomNavItems: NavigationItem[] = [
  {
    href: '/settings',
    title: 'Settings',
    icon: Settings,
  },
];

export const navUserNavItems: NavigationItem[] = [
  {
    href: '/profile',
    title: 'Profile',
    icon: UserCircle,
  },
];

export function getPageTitle(pathname: string): string {
  const currentNavItem = [
    ...navItems,
    ...bottomNavItems,
    ...navUserNavItems,
  ].find(
    (item) =>
      item.href === pathname ||
      (item.href !== '/' && pathname.startsWith(item.href))
  );
  if (currentNavItem) {
    return currentNavItem.title;
  }
  return 'Smart Study Planner';
}
