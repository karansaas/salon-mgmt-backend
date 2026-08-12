import { Router } from 'express';
import { exportReport, getReportByType } from '../controllers/report.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
export const reportRouter = Router(); reportRouter.use(requireAuth); reportRouter.get('/:type/export', exportReport); reportRouter.get('/:type', getReportByType);
