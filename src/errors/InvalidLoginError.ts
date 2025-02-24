import type { ValidationError } from '@/types/response';
import type { LoginSchema } from '@/schemas/auth/login.schema';
import { CredentialsSignin } from 'next-auth';

export class InvalidLoginError extends CredentialsSignin {
  code = 'Invalid email or password format';
  error: ValidationError<LoginSchema>;

  constructor(error: ValidationError<LoginSchema>) {
    super();
    this.error = error;
  }
}
