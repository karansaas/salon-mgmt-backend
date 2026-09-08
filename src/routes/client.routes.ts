import { Router } from 'express';
import { deleteClient, getClientBillingHistory, getClientById, getClientHistory, getClients, postClient, putClient } from '../controllers/client.controller.js';
import { requireAuth, requireNonEmployee } from '../middleware/auth.middleware.js';
import { getClientLoyalty, postAdjustment } from '../controllers/loyalty.controller.js';

export const clientRouter = Router();
clientRouter.use(requireAuth);
clientRouter.get('/', getClients);
clientRouter.get('/:id/history', getClientHistory);
clientRouter.get('/:id/bills', getClientBillingHistory);
clientRouter.get('/:clientId/loyalty', getClientLoyalty);
clientRouter.post('/:clientId/loyalty/adjustments', postAdjustment);
clientRouter.get('/:id', getClientById);
clientRouter.post('/', postClient);
clientRouter.use(requireNonEmployee);
clientRouter.put('/:id', putClient);
clientRouter.delete('/:id', deleteClient);
