import { ErrorRequestHandler, Request, Response } from 'express';
import { MongoServerError } from 'mongodb';
import { Error as MongooseError } from 'mongoose';
import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';

export const notFound = (_req: Request, res: Response): void => {
  res.status(404).json({ message: 'Route not found' });
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const duplicate = error instanceof MongoServerError && error.code === 11000;
  const validation = error instanceof MongooseError.ValidationError;
  const cast = error instanceof MongooseError.CastError;
  const status = error instanceof AppError ? error.statusCode : duplicate ? 409 : validation || cast ? 400 : 500;
  const message = error instanceof AppError
    ? error.message
    : duplicate
      ? error.keyPattern?.mobileNumber ? 'A record with this mobile number already exists' : error.keyPattern?.sku ? 'A product with this SKU already exists' : error.keyPattern?.name ? 'A record with this name already exists' : 'A record with this value already exists'
      : validation || cast ? 'Invalid request data' : 'Internal server error';
  if (status === 500) console.error(error);
  res.status(status).json({ message, ...(env.nodeEnv === 'development' && status === 500 ? { stack: error.stack } : {}) });
};
