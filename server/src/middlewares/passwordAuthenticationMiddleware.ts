import { NextFunction, Response } from 'express';
import expressAsyncHandler from 'express-async-handler';
import bcrypt from 'bcrypt';
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';
import { User } from '../models/auth/user';
import { ApiResponse } from '../config/ApiResponse';

// Middleware to verify a user's password sent via header/body/query/params
export const requirePassword = expressAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const providedPassword =
      (req.body && (req.body as any).xpassword) ||
      (req.headers && (req.headers['x-password'] as string)) ||
      (req.query && (req.query as any).xpassword) ||
      (req.params && (req.params as any).xpassword);

    if (!providedPassword) {
      return ApiResponse(
        res,
        400,
        'Password required',
        false,
        null,
        'Password Authentication Error',
      );
    }

    const userId = req.data?.userId;
    if (!userId) {
      return ApiResponse(
        res,
        401,
        'Unauthenticated',
        false,
        null,
        'Authentication Error',
      );
    }

    // Include password hash in the query
    const user = await User.findById(userId).select('+password');

    if (!user || !user.password) {
      return ApiResponse(
        res,
        403,
        'Password not set for this account',
        false,
        null,
        'Password Authentication Error',
      );
    }

    const match = await bcrypt.compare(String(providedPassword), user.password);

    if (!match) {
      return ApiResponse(
        res,
        401,
        'Invalid password',
        false,
        null,
        'Password Authentication Error',
      );
    }

    next();
  },
);

export default requirePassword;
