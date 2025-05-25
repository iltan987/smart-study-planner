import { cookies } from 'next/headers';
import { AppSidebar } from './AppSidebar';
import { SiteHeader } from './SiteHeader';
import { Separator } from './ui/separator';
import { SidebarInset, SidebarProvider } from './ui/sidebar';

export async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar variant="floating" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <main className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 h-full">
              {children}
            </main>
          </div>
          <div className="px-4 sm:px-6">
            <Separator className="bg-gradient-to-r from-primary/10 via-primary/50 to-primary/10 h-0.5 rounded-full" />
          </div>
          <footer className="flex p-1 items-center justify-center border-t bg-background">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Smart Study Planner
            </p>
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
