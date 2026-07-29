import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const signToken = (userId: string): string =>
  jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'] });

export const verifyToken = (token: string): { sub: string } =>
  jwt.verify(token, env.jwtSecret) as { sub: string };
