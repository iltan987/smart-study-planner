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
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
};
export default RootLayout;
