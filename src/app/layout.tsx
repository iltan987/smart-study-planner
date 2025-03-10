import { AuthProvider } from '@/providers/auth-provider';
import './globals.css';
import Sidebar from '../components/Sidebar';

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <div className="flex h-screen">
            {/* Sidebar - Always visible on desktop, toggled on mobile */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 pl-4 overflow-auto bg-gray-100">
              {children}
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
};

export default RootLayout;
