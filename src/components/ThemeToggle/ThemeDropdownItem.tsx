'use client';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';

export function ThemeDropdownItems() {
  const { themes, setTheme } = useTheme();
  return (
    <>
      {themes.map((theme) => (
        <DropdownMenuItem key={theme} onClick={() => setTheme(theme)}>
          {theme.charAt(0).toUpperCase() + theme.slice(1)}
        </DropdownMenuItem>
      ))}
    </>
  );
}
