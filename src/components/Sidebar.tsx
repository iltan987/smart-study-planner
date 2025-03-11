'use client';
import {
  Home,
  User,
  Settings,
  Calendar,
  Bot,
  ListTodo,
  LogOut,
  Menu,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils'; // Ensure cn function is available

const Sidebar = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false); // Closed by default on mobile
  const sidebarRef = useRef<HTMLDivElement>(null); // Reference to the sidebar

  // Toggle sidebar
  const handleToggleClick = () => {
    setIsOpen(true); // Open sidebar
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const menuItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'User Profile', icon: User, path: '/profile' },
    { name: 'Settings', icon: Settings, path: '/settings' },
    { name: 'Calendar', icon: Calendar, path: '/calendar' },
    { name: 'Chatbot', icon: Bot, path: '/chatbot' },
    { name: 'To-Do List', icon: ListTodo, path: '/todo' },
    { name: 'Logout', icon: LogOut, path: '#' },
  ];

  // Separate main menu items from the logout item
  const mainItems = menuItems.filter((item) => item.name !== 'Logout');
  const logoutItem = menuItems.find((item) => item.name === 'Logout');

  return (
    <>
      {/* Toggle Button - Only visible on mobile and disappears when sidebar is open */}
      {!isOpen && (
        <div className="max-h-screen w-[30px] bg-gray-100 md:hidden">
          <button
            onClick={handleToggleClick}
            className="fixed top-2 p-4 rounded-md md:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={cn(
          'h-screen bg-white shadow-lg p-4 transition-all duration-300 flex flex-col md:w-64',
          isOpen ? 'w-64 absolute left-0 top-0 z-40 flex' : 'hidden md:flex'
        )}
      >
        {/* Container to push logout button to the bottom */}
        <div className="flex flex-col justify-between h-full">
          <div className="flex flex-col gap-4">
            {mainItems.map(({ name, icon: Icon, path }) => (
              <button
                key={name}
                onClick={() => {
                  router.push(path);
                  setIsOpen(false); // Close sidebar on navigation (mobile only)
                }}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-200"
              >
                <Icon className="w-6 h-6" />
                <span>{name}</span>
              </button>
            ))}
          </div>
          {logoutItem && (
            <div>
              <button
                onClick={() => {
                  router.push(logoutItem.path);
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-200 "
              >
                <logoutItem.icon className="w-6 h-6" />
                <span>{logoutItem.name}</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
