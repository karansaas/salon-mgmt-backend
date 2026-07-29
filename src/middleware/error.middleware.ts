import { ErrorRequestHandler, Request, Response } from 'express';
import { MongoServerError } from 'mongodb';
import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';

export const notFound = (_req: Request, res: Response): void => {
  res.status(404).json({ message: 'Route not found' });
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const duplicate = error instanceof MongoServerError && error.code === 11000;
  const status = error instanceof AppError ? error.statusCode : duplicate ? 409 : 500;
  const message = error instanceof AppError ? error.message : duplicate ? 'A record with this value already exists' : 'Internal server error';
  if (status === 500) console.error(error);
  res.status(status).json({ message, ...(env.nodeEnv === 'development' && status === 500 ? { stack: error.stack } : {}) });
};
