import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import AppError from '../utils/ApiError';

export const validate = (schema: AnyZodObject) =>
    (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        } catch (error: any) {
            if (error instanceof ZodError) {
                 // Format Zod errors for better readability
                const errorMessages = error.errors.map((issue: any) => ({
                    field: issue.path.join('.'),
                    message: issue.message,
                }));
                 // Use 400 Bad Request for validation errors
                return next(new AppError(`Input validation failed: ${errorMessages[0].message}`, 400));
                // Or pass all errors:
                // return res.status(400).json({ status: 'fail', errors: errorMessages });
            }
             // Pass other errors to the global error handler
            next(new AppError('Internal server error during validation', 500));
        }
    };