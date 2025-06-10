'use client';

import { register } from '@/actions/register.action';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type {
  RegisterUserFormSchema,
  RegisterUserSchema,
} from '@/schemas/register.schema';
import { registerUserFormSchema } from '@/schemas/register.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

export default function RegisterPageContent() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RegisterUserFormSchema>({
    resolver: zodResolver(registerUserFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterUserFormSchema) => {
    setIsSubmitting(true);
    setError(null);
    setErrors([]); // Clear previous errors
    form.clearErrors(); // Clear previous server errors

    try {
      const res = await register({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      if (!res.success) {
        if (typeof res.error === 'string') {
          setError(res.error || 'Registration failed.');
        } else {
          setErrors(res.error.formErrors);

          for (const [key, value] of Object.entries(res.error.fieldErrors)) {
            form.setError(key as keyof RegisterUserSchema, {
              message: value.join(', '),
              type: 'server',
            });
          }
        }
      } else {
        router.push('/');
      }
    } catch (err) {
      console.error('Registration submission error:', err);
      setError('An unexpected error occurred. Please try again.');
    }

    setIsSubmitting(false);
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="grid p-0 md:grid-cols-2">
        {/* Form Section */}
        <div>
          <CardHeader className="space-y-1 text-center md:text-left">
            <CardTitle className="text-2xl">Create an Account</CardTitle>
            <CardDescription>Enter your details to register.</CardDescription>
          </CardHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 p-6"
            >
              {/* Show general error */}
              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}
              {/* Show form (zod) errors in a styled alert box */}
              {errors.length > 0 && (
                <div className="mb-2 rounded border border-destructive bg-destructive/10 p-3 text-destructive text-sm">
                  <ul className="list-disc pl-5 space-y-1">
                    {errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nazhin Abdolbaghi"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
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
                        type="email"
                        placeholder="m@example.com"
                        disabled={isSubmitting}
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
                        type="password"
                        placeholder="********"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
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
                        type="password"
                        placeholder="********"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <CardFooter className="flex flex-col gap-4 p-0 pt-2">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Registering...' : 'Register'}
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="font-semibold text-primary hover:underline"
                  >
                    Login
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Form>
        </div>

        {/* Image Section */}
        <div className="relative hidden bg-muted md:block">
          <Image
            src="/auth.png"
            alt="Register page image"
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            fill
            priority
          />
        </div>
      </CardContent>
    </Card>
  );
}
