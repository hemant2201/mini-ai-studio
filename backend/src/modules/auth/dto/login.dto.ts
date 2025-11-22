import { z } from 'zod';

/**
 * Login DTO Schema
 * Validates user login request data
 */
export const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginDto = z.infer<typeof LoginSchema>;