import type { TypeOf, ZodTypeAny, typeToFlattenedError } from 'zod';

export type ValidationError<T extends TypeOf<ZodTypeAny>> =
  typeToFlattenedError<T>;

export type ErrorResponse<T extends TypeOf<ZodTypeAny>> = {
  success: false;
  error: string | ValidationError<T>;
};

type SuccessWithData<T> = {
  data: T;
};

export type SuccessResponse<T> = {
  success: true;
  message: string;
} & (T extends undefined ? object : SuccessWithData<T>);

export type Response<T extends TypeOf<ZodTypeAny>, U = undefined> =
  | ErrorResponse<T>
  | SuccessResponse<U>;
