'use client';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';
import type { SetStateAction } from 'react';

export function ThemeDropdownItem({
  value,
  label,
}: {
  value: SetStateAction<string>;
  label: string;
}) {
  const { setTheme } = useTheme();
  return (
    <DropdownMenuItem key={value.toString()} onClick={() => setTheme(value)}>
      {label}
    </DropdownMenuItem>
  );
}
