import { ThemeToggle } from '@/components/ThemeToggle';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <div className="flex w-full max-w-4xl flex-col gap-6">{children}</div>
    </div>
  );
}
