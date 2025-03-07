import { RESPONSE_MESSAGES_ERRORS } from '@/constants/response-messages';
import { CredentialsSignin } from 'next-auth';

export class InternalServerError extends CredentialsSignin {
  constructor(message?: string) {
    super(message || RESPONSE_MESSAGES_ERRORS.INTERNAL_SERVER_ERROR);
  }
}
