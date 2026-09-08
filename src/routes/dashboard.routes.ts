import { Router } from 'express';
import { getOverview } from '../controllers/dashboard.controller.js';
import { requireAuth, requireNonEmployee } from '../middleware/auth.middleware.js';

export const dashboardRouter = Router();
dashboardRouter.use(requireAuth, requireNonEmployee);
dashboardRouter.get('/overview', getOverview);
