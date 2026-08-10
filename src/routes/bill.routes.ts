import { Router } from 'express'; import { getBillById, getBills, postBill } from '../controllers/bill.controller.js'; import { requireAuth } from '../middleware/auth.middleware.js';
export const billRouter = Router(); billRouter.use(requireAuth); billRouter.get('/', getBills); billRouter.get('/:id', getBillById); billRouter.post('/', postBill);
