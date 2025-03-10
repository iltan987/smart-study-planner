import { AuthProvider } from '@/providers/auth-provider';
import Link from 'next/link';
import './globals.css';
import Sidebar from '@/components/Sidbar';

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <div className="flex h-screen x-space-1">
            {/* Sidebar - 1/6 width */}
            <div className="w-1/6">
              <Sidebar />
            </div>

            {/* Main Content - 5/6 width */}
            <div className="w-5/6">{children}</div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
};

export default RootLayout;
