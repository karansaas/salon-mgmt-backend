import { NextFunction, Request, Response } from 'express';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { verifyToken } from '../utils/jwt.js';

export const requireAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const [scheme, bearerToken] = req.headers.authorization?.split(' ') ?? [];
    const token = scheme === 'Bearer' ? bearerToken : req.cookies?.salon_token as string | undefined;
    if (!token) throw new AppError(401, 'Authentication required');
    const { sub } = verifyToken(token);
    const user = await User.findById(sub).select('+password');
    if (!user || !user.isActive) throw new AppError(401, 'Your account is unavailable');
    req.user = user;
    next();
  } catch (error) { next(error instanceof AppError ? error : new AppError(401, 'Invalid or expired token')); }
};
