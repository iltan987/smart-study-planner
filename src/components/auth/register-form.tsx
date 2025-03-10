'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  type RegisterSchema,
  registerSchema,
} from '@/schemas/auth/register.schema';
import { useTransition } from 'react';
import { register } from '@/actions/auth/register.action';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { toast } from 'sonner';
import { signIn } from 'next-auth/react';

export function RegisterForm() {
  const [isPending, startTransition] = useTransition();
  const { push } = useRouter();

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (values: RegisterSchema) => {
    startTransition(async () => {
      const res = await register(values);

      if (res.success) {
        await signIn('credentials', {
          email: values.email,
          password: values.password,
          redirect: false,
        });
        toast.success(res.message);
        push('/');
      } else {
        if (typeof res.error === 'string') {
          toast.error(res.error);
        } else {
          if (res.error.formErrors && res.error.formErrors.length > 0) {
            toast.error(res.error.formErrors[0]);
          }
          for (const [key, value] of Object.entries(res.error.fieldErrors)) {
            form.setError(key as keyof RegisterSchema, {
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
          <CardTitle className="text-2xl">Register</CardTitle>
          <CardDescription>Create an account below to register</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isPending}
                          placeholder="Enter your name"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Your name.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                      <FormDescription>Your email address.</FormDescription>
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
                      <FormDescription>
                        Choose a strong password.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isPending}
                          type="password"
                          placeholder="Confirm your password"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Confirm your password.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isPending} className="w-full">
                  {isPending ? 'Registering...' : 'Register'}
                </Button>

                <Button variant="outline" className="w-full" disabled>
                  Register with Google (Coming soon)
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Already have an account?{' '}
                <Link href="/login" className="underline underline-offset-4">
                  Login here
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
