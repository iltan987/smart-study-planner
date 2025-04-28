import { BotIcon, Calendar, Home, List, Settings, User } from 'lucide-react';

export const navigationItems = [
  {
    title: 'Home',
    url: '/',
    icon: Home,
  },
  {
    title: 'Profile',
    url: '/profile',
    icon: User,
  },
  {
    title: 'Calendar',
    url: '/calendar',
    icon: Calendar,
  },
  {
    title: 'ChatBot',
    url: '/chatbot',
    icon: BotIcon,
  },
  {
    title: 'Todo List',
    url: '/todo',
    icon: List,
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
  },
] as const;

export const userNavigationItems = [
  {
    title: 'Profile',
    url: '/profile',
    icon: User,
  },
] as const;
