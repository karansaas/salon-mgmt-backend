import { Router } from 'express';
import { getOverview } from '../controllers/dashboard.controller.js';
import { requireAuth, requireManagementUser } from '../middleware/auth.middleware.js';

export const dashboardRouter = Router();
dashboardRouter.use(requireAuth, requireManagementUser);
dashboardRouter.get('/overview', getOverview);
