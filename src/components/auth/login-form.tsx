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
import { FormResult } from './form-result';

const LoginForm = () => {
  const [isPending, startTransition] = useTransition();
  const [formResult, setFormResult] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const onSubmit = (data: LoginSchema) => {
    startTransition(() => {
      setFormResult(null);
      login(data).then((res) => {
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
              form.setError(key as keyof LoginSchema, {
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
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Logging in...' : 'Login'}
        </Button>

        {formResult && (
          <FormResult message={formResult.message} type={formResult.type} />
        )}
      </form>
    </Form>
  );
};

export default LoginForm;
