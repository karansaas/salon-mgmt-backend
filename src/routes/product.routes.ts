import { Router } from 'express';
import { deleteProduct, getHistory, getLowStock, getProductById, getProducts, postProduct, postStock, putProduct } from '../controllers/product.controller.js';
import { requireAuth, requireNonEmployee } from '../middleware/auth.middleware.js';
export const productRouter = Router(); productRouter.use(requireAuth); productRouter.get('/', getProducts); productRouter.get('/low-stock', requireNonEmployee, getLowStock); productRouter.get('/:id/history', requireNonEmployee, getHistory); productRouter.get('/:id', getProductById); productRouter.post('/', postProduct); productRouter.put('/:id', putProduct); productRouter.delete('/:id', requireNonEmployee, deleteProduct); productRouter.post('/:id/stock', requireNonEmployee, postStock);
