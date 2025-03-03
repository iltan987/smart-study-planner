import { LoginForm } from '@/components/auth/login-form';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const redirectTo = (await searchParams)?.redirect || '/';
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="p-6 rounded shadow-md">
        <h1 className="text-2xl font-bold mb-6">Login</h1>
        <LoginForm redirectTo={redirectTo} />
      </div>
    </div>
  );
}
