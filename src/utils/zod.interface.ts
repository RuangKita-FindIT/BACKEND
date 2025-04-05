import { ZodError } from "zod";

export interface ZodDataInterface<T> {
  success: boolean;
  error?: ZodError;
  data: T;
}
