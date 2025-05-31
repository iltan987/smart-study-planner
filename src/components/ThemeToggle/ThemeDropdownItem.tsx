'use client';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';

export function ThemeDropdownItem({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  const { setTheme } = useTheme();
  return (
    <DropdownMenuItem key={value} onClick={() => setTheme(value)}>
      {label}
    </DropdownMenuItem>
  );
}
