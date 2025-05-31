import type { ValidationError } from '@/types/zod';
import type z from 'zod';
import type { ZodTypeAny } from 'zod';

export class ValidationException<T extends z.infer<ZodTypeAny>> extends Error {
  fieldErrors: ValidationError<T>['fieldErrors'];
  formErrors: ValidationError<T>['formErrors'];

  constructor(message: string, error: ValidationError<T>) {
    super(message);
    this.name = 'ValidationException';
    this.fieldErrors = error.fieldErrors;
    this.formErrors = error.formErrors;
  }
}
