import { NextFunction, Request, Response } from 'express';
import { loginUser, publicUser } from '../services/auth.service.js';
import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';

// The deployed API and frontend are hosted on different origins. Production
// cookies therefore require SameSite=None and HTTPS to be sent with API calls.
const cookieSettings = { httpOnly: true, sameSite: env.nodeEnv === 'production' ? 'none' as const : 'strict' as const, secure: env.nodeEnv === 'production' };
const cookieOptions = { ...cookieSettings, maxAge: 24 * 60 * 60 * 1000 };

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email?.trim() || !password) throw new AppError(400, 'Email and password are required');
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new AppError(400, 'Please provide a valid email address');
    const session = await loginUser(email, password);
    res.cookie('salon_token', session.token, cookieOptions).status(200).json({ user: session.user });
  } catch (error) { next(error); }
};

export const logout = (_req: Request, res: Response): void => { res.clearCookie('salon_token', cookieSettings).status(204).send(); };

export const me = (req: Request, res: Response): void => {
  if (!req.user) throw new AppError(401, 'Authentication required');
  res.json({ user: publicUser(req.user) });
};
