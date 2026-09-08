import { NextFunction, Request, Response } from 'express';
import { User } from '../models/User.js';
import { Employee } from '../models/Employee.js';
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
    if (user.role === 'Employee' && (!user.employee || !await Employee.exists({ _id: user.employee, isActive: true }))) throw new AppError(401, 'Your employee account is unavailable');
    req.user = user;
    next();
  } catch (error) { next(error instanceof AppError ? error : new AppError(401, 'Invalid or expired token')); }
};

export const requireAdmin = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.user) return next(new AppError(401, 'Authentication required'));
  if (req.user.role !== 'Admin') return next(new AppError(403, 'Administrator access is required'));
  next();
};

export const requireNonEmployee = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.user) return next(new AppError(401, 'Authentication required'));
  if (req.user.role === 'Employee') return next(new AppError(403, 'You do not have permission to access this resource'));
  next();
};

export const requireEmployee = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.user) return next(new AppError(401, 'Authentication required'));
  if (req.user.role !== 'Employee' || !req.user.employee) return next(new AppError(403, 'Employee access is required'));
  next();
};
