'use client';

import { getPageTitle } from '@/config/navItems';
import { usePathname } from 'next/navigation';

export function PageTitle() {
  const pathname = usePathname();
  const currentPageTitle = getPageTitle(pathname);
  return <h1 className="text-base font-medium">{currentPageTitle}</h1>;
}
