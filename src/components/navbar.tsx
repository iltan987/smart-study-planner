import { navigationItems, userNavigationItems } from '@/config/navigation';
import { usePathname } from 'next/navigation';
import { SidebarTrigger } from './ui/sidebar';

export function Navbar() {
  const pathname = usePathname();

  const getTitle = (path: string) => {
    const item = navigationItems.find((item) => item.url === path);
    if (item) {
      return item.title;
    } else {
      const userItem = userNavigationItems.find((item) => item.url === path);
      if (userItem) {
        return userItem.title;
      }
    }
    return 'Not Found';
  };

  return (
    <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-4 px-4">
        <SidebarTrigger />
        <h1 className="text-lg font-semibold">{getTitle(pathname)}</h1>
      </div>
    </div>
  );
}
