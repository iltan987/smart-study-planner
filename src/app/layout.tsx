import { SessionProvider } from '@/providers/session-provider';
import './globals.css';
import MainLayout from '@/components/main-layout';

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SessionProvider>
          <MainLayout>{children}</MainLayout>
        </SessionProvider>
      </body>
    </html>
  );
};
export default RootLayout;
