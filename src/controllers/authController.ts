import { Request, Response, NextFunction, CookieOptions } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import AppError from "../utils/ApiError";
import { RegisterUserInput, LoginUserInput } from "../schemas/userSchema";

const signToken = (id: string): string => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN;

  if (!secret || !expiresIn) {
    throw new Error(
      "JWT Secret or Expiration not defined in environment variables"
    );
  }
  return jwt.sign({ id }, secret, { expiresIn: "1h" });
};

export const register = async (
  req: Request<{}, {}, RegisterUserInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists (redundant with unique index but good practice)
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return next(new AppError("Email or Username already exists", 400));
    }

    // Create new user (hashing handled by pre-save hook)
    const newUser = await User.create({ username, email, password });

    // Remove password from output
    const userResponse = newUser.toObject();
    delete userResponse.password;

    if (!newUser._id) {
      return next(new AppError("User ID not found", 500)); // 500 Internal Server Error
    }

    res.status(201).json({
      status: "success",
      data: {
        user: userResponse,
      },
    });
  } catch (error) {
    next(error); // Pass error to global error handler
  }
};

export const login = async (
  req: Request<{}, {}, LoginUserInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email }).select("+password"); // Explicitly select password

    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError("Incorrect email or password", 401)); // 401 Unauthorized
    }
    if (!user._id) {
      return next(new AppError("User ID not found", 500)); // 500 Internal Server Error
    }

    // 3) If everything ok, send token to client
    const token = signToken(user._id.toString() as string);

    // Remove password from output before sending user data (optional)
    const userResponse = user.toObject();
    delete userResponse.password;


    const options = {
      httpOnly: true,
      expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      // Assert the type of the ternary result
      sameSite: (process.env.NODE_ENV === "production" ? "lax" : "none") as
        | "lax"
        | "none", // Corrected logic and added assertion
      secure: process.env.NODE_ENV === "production",
    };

    res
      .status(200)
      // Cast options if needed, though Option 1 avoids this
      .cookie("ACCESS_TOKEN", token, options as CookieOptions)
      .json({
        status: "success",
        token,
        data: {
          user: userResponse,
        },
      });
  } catch (error) {
    next(error);
  }
};

// Optional: Get current user profile
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // User is attached by authenticateToken middleware
    if (!req.user) {
      return next(
        new AppError("User not found on request. This should not happen.", 500)
      );
    }
    // Fetch fresh user data if needed, or return req.user
    const user = await User.findById(req.user._id); // req.user._id should exist

    if (!user) {
      return next(
        new AppError("User associated with this token not found.", 404)
      );
    }

    res.status(200).json({
      status: "success",
      data: {
        user: user, // Send full user object (password is excluded by default schema selection)
      },
    });
  } catch (error) {
    next(error);
  }
};
