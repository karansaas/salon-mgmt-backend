import mongoose from 'mongoose';
import { env } from './env.js';

let connectionPromise: Promise<typeof mongoose> | undefined;

export const connectDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) return;

  connectionPromise ??= mongoose.connect(env.mongoUri).then((connection) => {
    console.info('MongoDB connected');
    return connection;
  }).catch((error: unknown) => {
    connectionPromise = undefined;
    throw error;
  });

  await connectionPromise;
};
