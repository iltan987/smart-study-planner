import {
  Calendar,
  Home,
  MessageSquare,
  Settings,
  Brain,
  List,
  User,
} from 'lucide-react';

export const navigationItems = [
  {
    title: 'Home',
    url: '/',
    icon: Home,
  },
  {
    title: 'Calendar',
    url: '/calendar',
    icon: Calendar,
  },
  {
    title: 'ChatBot',
    url: '/chatbot',
    icon: MessageSquare,
  },
  {
    title: 'ChatBot2',
    url: '/chatbot',
    icon: Brain,
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
