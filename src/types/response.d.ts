import type { ZodTypeAny, typeToFlattenedError, TypeOf } from 'zod';

export type ValidationError<T extends TypeOf<ZodTypeAny>> =
  typeToFlattenedError<T>;

export type ErrorResponse<T extends TypeOf<ZodTypeAny>> = {
  success: false;
  error: string | ValidationError<T>;
};

export type SuccessResponse = {
  success: true;
  message: string;
  redirect?: string;
};

export type Response<T extends TypeOf<ZodTypeAny>> =
  | ErrorResponse<T>
  | SuccessResponse;
