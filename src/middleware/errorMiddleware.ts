import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/ApiError';

interface CustomError extends Error {
    statusCode?: number;
    status?: string;
    isOperational?: boolean;
    path?: string; // Mongoose validation error path
    value?: string; // Mongoose validation error value
    code?: number; // Mongoose duplicate key error code
}

// Specific Error Handlers (can be moved to a helper file)
const handleCastErrorDB = (err: any): AppError => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err: any): AppError => {
     // Extract value from the error message using regex or string manipulation
    const value = err.message.match(/(["'])(\\?.)*?\1/)?.[0] || 'field';
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
};

const handleValidationErrorDB = (err: any): AppError => {
    const errors = Object.values(err.errors).map((el: any) => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};


// Global Error Handling Middleware
export const globalErrorHandler = (
    err: CustomError,
    req: Request,
    res: Response,
    next: NextFunction // next must be included even if not used for Express to recognize it as error middleware
) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log detailed error for developers in development environment
    if (process.env.NODE_ENV === 'development') {
        console.error('ERROR 💥:', err);
        console.error(err.stack);
    }

    let error = { ...err, message: err.message, name: err.name }; // Create a copy

    // Handle specific Mongoose errors
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error); // Duplicate key error
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
     if (error.name === 'JsonWebTokenError') error = new AppError('Invalid token. Please log in again.', 401);
     if (error.name === 'TokenExpiredError') error = new AppError('Your token has expired. Please log in again.', 401);


    // Operational, trusted error: send message to client
    if (error.isOperational) {
        return res.status(error.statusCode || 500).json({
            status: error.status || 'error',
            message: error.message,
        });
    }
    // Programming or other unknown error: don't leak error details
    else {
        // 1) Log error (already done in dev, consider logging in prod too)
        if (process.env.NODE_ENV !== 'development') {
            console.error('UNHANDLED ERROR 💥:', err);
        }

        // 2) Send generic message
        return res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!',
        });
    }
};