import { Router } from 'express';
import { deleteClient, getClientById, getClientHistory, getClients, postClient, putClient } from '../controllers/client.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

export const clientRouter = Router();
clientRouter.use(requireAuth);
clientRouter.get('/', getClients);
clientRouter.get('/:id/history', getClientHistory);
clientRouter.get('/:id', getClientById);
clientRouter.post('/', postClient);
clientRouter.put('/:id', putClient);
clientRouter.delete('/:id', deleteClient);
