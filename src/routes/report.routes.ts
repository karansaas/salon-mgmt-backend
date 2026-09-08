import { Router } from 'express';
import { exportReport, getReportByType } from '../controllers/report.controller.js';
import { requireAuth, requireNonEmployee } from '../middleware/auth.middleware.js';
export const reportRouter = Router(); reportRouter.use(requireAuth, requireNonEmployee); reportRouter.get('/:type/export', exportReport); reportRouter.get('/:type', getReportByType);
