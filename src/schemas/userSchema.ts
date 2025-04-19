import { z } from 'zod';

export const registerUserSchema = z.object({
  body: z.object({
    username: z.string({ required_error: 'Username is required' })
               .min(3, 'Username must be at least 3 characters long')
               .trim(),
    email: z.string({ required_error: 'Email is required' })
            .email('Invalid email address')
            .trim(),
    password: z.string({ required_error: 'Password is required' })
               .min(6, 'Password must be at least 6 characters long'),
  }),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>['body'];

export const loginUserSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' })
            .email('Invalid email address')
            .trim(),
    password: z.string({ required_error: 'Password is required' }),
  }),
});

export type LoginUserInput = z.infer<typeof loginUserSchema>['body'];