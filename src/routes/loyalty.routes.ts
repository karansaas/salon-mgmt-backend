import { Router } from 'express';
import { getConfig, putConfig } from '../controllers/loyalty.controller.js';
import { requireAuth, requireNonEmployee } from '../middleware/auth.middleware.js';

export const loyaltyRouter = Router();
loyaltyRouter.use(requireAuth);
loyaltyRouter.use(requireNonEmployee);
loyaltyRouter.get('/config', getConfig);
loyaltyRouter.put('/config', putConfig);
