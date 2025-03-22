'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './navbar';
import { Sidebar } from './sidebar';
import { SidebarProvider } from './ui/sidebar';

const AuthPages = ['/login', '/register'];

const MainLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const pathName = usePathname();
  const isAuthPage = AuthPages.includes(pathName);

  return (
    <>
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
    </>
  );
};

export default MainLayout;
