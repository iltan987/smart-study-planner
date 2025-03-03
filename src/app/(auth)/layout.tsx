'use client';

import { ThemeToggle } from '@/components/theme-toggle';

const AuthLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="relative">
      <div className="absolute right-4 top-4">
        <ThemeToggle isSidebar={false} />
      </div>
      {children}
    </div>
  );
};

export default AuthLayout;
