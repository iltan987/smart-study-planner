import type z from 'zod';
import type { typeToFlattenedError, ZodTypeAny } from 'zod';
import type { ZodSchemaOutput } from './zod';

// Represents the inferred type from any Zod schema
export type ZodSchemaOutput = z.infer<ZodTypeAny>;

// Type for validation errors returned by Zod
export type ValidationError<TSchema extends ZodSchemaOutput> =
  typeToFlattenedError<TSchema>;
