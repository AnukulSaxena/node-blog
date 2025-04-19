class AppError extends Error {
    public statusCode: number;
    public status: 'fail' | 'error';
    public isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true; // Errors we create are operational

        // Ensure the error stack trace is captured correctly
        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;