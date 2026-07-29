import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';
import { authRouter } from './routes/auth.routes.js';

export const app = express();
app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRouter);
app.use(notFound);
app.use(errorHandler);
