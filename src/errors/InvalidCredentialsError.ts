import { CredentialsSignin } from 'next-auth';

export class InvalidCredentialsError extends CredentialsSignin {
  code = 'Invalid email or password';
}
