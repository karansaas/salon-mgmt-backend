import { Router } from 'express';
import { getConfig, putConfig } from '../controllers/loyalty.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

export const loyaltyRouter = Router();
loyaltyRouter.use(requireAuth);
loyaltyRouter.get('/config', getConfig);
loyaltyRouter.put('/config', putConfig);
