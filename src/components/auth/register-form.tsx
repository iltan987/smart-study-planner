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
import { FormResult } from '@/components/auth/form-result';
import { useState } from 'react';

export function RegisterForm() {
  const [isPending, startTransition] = useTransition();
  const [formResult, setFormResult] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

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
    startTransition(() => {
      setFormResult(null);
      register(values).then((res) => {
        if (res.success) {
          setFormResult({
            message: res.message,
            type: 'success',
          });
        } else {
          if (typeof res.error === 'string') {
            setFormResult({
              message: res.error,
              type: 'error',
            });
          } else {
            setFormResult({
              message: res.error.formErrors[0],
              type: 'error',
            });
            for (const [key, value] of Object.entries(res.error.fieldErrors)) {
              form.setError(key as keyof RegisterSchema, {
                message: value[0],
              });
            }
          }
        }
      });
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          disabled={isPending}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your name" {...field} />
              </FormControl>
              <FormDescription>Your name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          disabled={isPending}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter your email" {...field} />
              </FormControl>
              <FormDescription>Your email address.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          disabled={isPending}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  {...field}
                />
              </FormControl>
              <FormDescription>Choose a strong password.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          disabled={isPending}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input
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

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Registering...' : 'Register'}
        </Button>

        {formResult && (
          <FormResult message={formResult.message} type={formResult.type} />
        )}
      </form>
    </Form>
  );
}
