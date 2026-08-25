import type { Request, Response } from 'express';
import { app } from '../src/app.js';
import { connectDatabase } from '../src/config/database.js';

// Vercel invokes this handler per request. The database module reuses the
// connection while the function instance stays warm.
export default async function handler(req: Request, res: Response): Promise<void> {
  try {
    await connectDatabase();
    app(req, res);
  } catch (error) {
    console.error('Database connection failed', error);
    res.status(503).json({ message: 'The service is temporarily unavailable. Please try again shortly.' });
  }
}
