import { RESPONSE_MESSAGES_ERRORS } from '@/constants/response-messages';
import type { LoginSchema } from '@/schemas/auth/login.schema';
import { CredentialsSignin } from 'next-auth';
import type { typeToFlattenedError } from 'zod';

export class InvalidCredentialsError extends CredentialsSignin {
  constructor({
    message,
    errors,
  }: { message?: string; errors?: typeToFlattenedError<LoginSchema> } = {}) {
    super(message || RESPONSE_MESSAGES_ERRORS.INVALID_CREDENTIALS);
    this.errors = errors;
  }

  errors?: typeToFlattenedError<LoginSchema>;
}
