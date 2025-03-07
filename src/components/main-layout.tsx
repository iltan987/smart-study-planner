'use client';

import { SidebarProvider } from '@/components/ui/sidebar';
import { Sidebar } from '@/components/sidebar';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from 'next-themes';
import { Navbar } from './navbar';
import { AuthProvider } from '@/providers/auth-provider';
import { Toaster } from '@/components/ui/sonner';

const AuthPages = ['/login', '/register'];

const MainLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const pathName = usePathname();
  const isAuthPage = AuthPages.includes(pathName);

  return (
    <AuthProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Toaster />
        {isAuthPage ? (
          children
        ) : (
          <SidebarProvider>
            <div className="flex min-h-screen">
              <Sidebar />
              <div className="flex-1">
                <Navbar />
                <main className="p-4">{children}</main>
              </div>
            </div>
          </SidebarProvider>
        )}
      </ThemeProvider>
    </AuthProvider>
  );
};

export default MainLayout;
