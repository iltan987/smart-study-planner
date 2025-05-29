import type { ValidationError, ZodSchemaOutput } from './zod';

/**
 * Generic success result type.
 */
type SuccessResult<TData = undefined> = {
  success: true;
  message?: string;
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
} & (TData extends undefined ? {} : { data: TData });

/**
 * Generic error result type (includes validation errors).
 */
type ErrorResult<TSchema extends ZodSchemaOutput = undefined> = {
  success: false;
  error: TSchema extends undefined ? string : string | ValidationError<TSchema>;
};

/**
 * Union type representing all possible function results.
 */
export type Result<
  TData = undefined,
  TSchema extends ZodSchemaOutput = undefined,
> = SuccessResult<TData> | ErrorResult<TSchema>;
