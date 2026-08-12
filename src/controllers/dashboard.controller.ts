import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError.js';
import { getDashboardOverview } from '../services/dashboard.service.js';

export const getOverview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const from = typeof req.query.from === 'string' ? req.query.from : undefined;
    const to = typeof req.query.to === 'string' ? req.query.to : undefined;
    res.json(await getDashboardOverview(from, to));
  } catch (error) {
    next(error instanceof Error && /date/i.test(error.message) ? new AppError(400, error.message) : error);
  }
};
