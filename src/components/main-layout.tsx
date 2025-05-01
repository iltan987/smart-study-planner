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
          <div className="flex h-screen w-full overflow-hidden">
            <Sidebar />
            <div className="flex flex-col flex-1 h-full">
              <Navbar />
              <div className="flex-1 overflow-y-auto scroll-smooth">
                <main className="h-full">{children}</main>
              </div>
            </div>
          </div>
        </SidebarProvider>
      )}
    </>
  );
};

export default MainLayout;
