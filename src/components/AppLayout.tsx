import { SidebarChatProvider } from '@/hooks/useSidebarChat';
import { cookies } from 'next/headers';
import type { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';
import { MainContent } from './MainContent';
import { SiteHeader } from './SiteHeader';
import { Separator } from './ui/separator';
import { SidebarProvider } from './ui/sidebar';

export async function AppLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <SidebarChatProvider>
        <div className="flex h-screen w-full">
          <AppSidebar variant="floating" className="flex flex-col" />
          <div className="flex-1 flex flex-col">
            <SiteHeader />
            <MainContent>{children}</MainContent>
            <div>
              <div className="px-4 sm:px-6">
                <Separator className="bg-gradient-to-r from-primary/10 via-primary/50 to-primary/10 h-0.5 rounded-full" />
              </div>
              <footer className="flex p-1 items-center justify-center border-t bg-background">
                <p className="text-sm text-muted-foreground">
                  © {new Date().getFullYear()} Smart Study Planner
                </p>
              </footer>
            </div>
          </div>
        </div>
      </SidebarChatProvider>
    </SidebarProvider>
  );
}
