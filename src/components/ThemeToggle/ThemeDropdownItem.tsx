'use client';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Laptop, Moon, Sun } from 'lucide-react'; // Import icons
import { useTheme } from 'next-themes';

export function ThemeDropdownItems() {
  const { themes, setTheme } = useTheme();

  const getIconForTheme = (theme: string) => {
    switch (theme) {
      case 'light':
        return <Sun className="mr-2 h-4 w-4" />;
      case 'dark':
        return <Moon className="mr-2 h-4 w-4" />;
      case 'system':
        return <Laptop className="mr-2 h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <>
      {themes.map((theme) => (
        <DropdownMenuItem key={theme} onClick={() => setTheme(theme)}>
          {getIconForTheme(theme)}
          {theme.charAt(0).toUpperCase() + theme.slice(1)}
        </DropdownMenuItem>
      ))}
    </>
  );
}
