import { RegisterForm } from '@/components/auth/register-form';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="p-6 rounded shadow-md">
        <h1 className="text-2xl font-bold mb-6">Register</h1>
        <RegisterForm />
      </div>
    </div>
  );
}
