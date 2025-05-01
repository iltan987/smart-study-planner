'use client';

import { login } from '@/actions/auth/login.action';
import { RESPONSE_MESSAGES_SUCCESS } from '@/constants/response-messages';
import { cn } from '@/lib/utils';
import { loginSchema, type LoginSchema } from '@/schemas/auth/login.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';

export function LoginForm({
  className,
  ...props
}: {
  className?: string;
  [key: string]: unknown;
}) {
  const [isPending, startTransition] = useTransition();
  const { update } = useSession();
  const { push } = useRouter();

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginSchema) => {
    startTransition(async () => {
      const res = await login(data);

      if (res.success) {
        toast.success(RESPONSE_MESSAGES_SUCCESS.LOGIN_SUCCESS);

        update(data);
        push('/');
      } else {
        if (typeof res.error === 'string') {
          toast.error(res.error);
        } else {
          if (res.error.formErrors && res.error.formErrors.length > 0) {
            toast.error(res.error.formErrors[0]);
          }
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
    <div className={cn('flex flex-col gap-6', className || '')} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">
                    Welcome to Smart Study Planner
                  </h1>
                </div>
                <div className="grid gap-2">
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
                </div>
                <div className="grid gap-2">
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
                </div>
                <Button type="submit" disabled={isPending} className="w-full">
                  {isPending ? 'Logging in...' : 'Login'}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="underline underline-offset-4">
                  Sign up
                </Link>
              </div>
            </form>
          </Form>
          <div className="relative hidden bg-muted md:block">
            <Image
              src="/images/loginpage.png"
              alt="Smart Study Planner"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
              fill
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
