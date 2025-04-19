import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import AppError from '../utils/ApiError';
import User, { IUser } from '../models/User'; // Import User model and interface

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined.');
    process.exit(1);
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined;

    const cookies = req?.cookies;
    console.log('Cookies:', cookies);
    if (cookies && Object?.keys(cookies)?.length > 0) {
      token = cookies?.ACCESS_TOKEN;
      console.log('Token from cookies:', token);
    }

    if ( !token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    // Add check for token in cookies if needed: else if (req.cookies.token) { token = req.cookies.token; }

    if (!token) {
        return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    try {
        // 2) Verify token
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

        // 3) Check if user still exists
        const currentUser = await User.findById(decoded.id).select('+password'); // Temporarily select password if needed downstream, otherwise omit
        if (!currentUser) {
            return next(new AppError('The user belonging to this token does longer exist.', 401));
        }

        // TODO: 4) Check if user changed password after the token was issued (optional but recommended)
        // if (currentUser.passwordChangedAfter(decoded.iat)) {
        //     return next(new AppError('User recently changed password! Please log in again.', 401));
        // }

        // GRANT ACCESS TO PROTECTED ROUTE
        // Attach user to the request object (excluding password for safety)
        const userForRequest = currentUser.toObject();
        delete userForRequest.password; // Ensure password is not on req.user
        req.user = userForRequest as IUser; // Assign the user object

        next();
    } catch (err: any) {
        if (err.name === 'JsonWebTokenError') {
            return next(new AppError('Invalid token. Please log in again.', 401));
        }
        if (err.name === 'TokenExpiredError') {
            return next(new AppError('Your token has expired. Please log in again.', 401));
        }
        // Pass other errors down
        next(err);
    }
};