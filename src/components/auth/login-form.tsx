'use client';

import { loginSchema, type LoginSchema } from '@/schemas/auth/login.schema';
import { useForm } from 'react-hook-form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { login } from '@/actions/auth/login.action';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '../ui/form';
import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from '@/providers/session-provider';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [isPending, startTransition] = useTransition();
  const [formResult, setFormResult] = useState<{
    message: string;
  } | null>(null);
  const router = useRouter();
  const { update } = useSession();
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const onSubmit = async (data: LoginSchema) => {
    startTransition(async () => {
      setFormResult(null);
      const res = await login(data);
      if (res.success) {
        await update();
        router.push(redirectTo);
      } else {
        if (typeof res.error === 'string') {
          setFormResult({
            message: res.error,
          });
        } else {
          setFormResult({
            message: res.error.formErrors[0],
          });
          for (const [key, value] of Object.entries(res.error.fieldErrors)) {
            form.setError(key as keyof LoginSchema, {
              message: value[0],
            });
          }
        }
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isPending}
                          type="email"
                          placeholder="Enter your email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isPending}
                          type="password"
                          placeholder="Enter your password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isPending} className="w-full">
                  {isPending ? 'Logging in...' : 'Login'}
                </Button>
                <Button variant="outline" className="w-full" disabled>
                  Login with Google (Coming soon)
                </Button>

                {formResult && (
                  <div
                    className={
                      'p-4 rounded-md bg-destructive/15 text-destructive'
                    }
                  >
                    {formResult.message}
                  </div>
                )}
              </div>
              <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="underline underline-offset-4">
                  Sign up
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
