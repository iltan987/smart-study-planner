import LoginForm from '@/components/auth/login-form';

export default async function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}
