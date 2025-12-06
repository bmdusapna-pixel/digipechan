import { NextFunction, Response } from 'express';
import expressAsyncHandler from 'express-async-handler';
import bcrypt from 'bcrypt';
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';
import { User } from '../models/auth/user';
import { ApiResponse } from '../config/ApiResponse';

export const requirePin = expressAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const providedPin =
      (req.body && (req.body as any).pin) ||
      (req.headers && (req.headers['x-pin'] as string)) ||
      (req.query && (req.query as any).pin);

    if (!providedPin) {
      return ApiResponse(
        res,
        400,
        'PIN required',
        false,
        null,
        'PIN Authentication Error',
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

    const user = await User.findById(userId).select('+pin');

    if (!user || !user.pin) {
      return ApiResponse(
        res,
        403,
        'PIN not set for this account',
        false,
        null,
        'PIN Authentication Error',
      );
    }

    const match = await bcrypt.compare(String(providedPin), user.pin);

    if (!match) {
      return ApiResponse(
        res,
        401,
        'Invalid PIN',
        false,
        null,
        'PIN Authentication Error',
      );
    }

    next();
  },
);

export default requirePin;
