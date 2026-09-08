import { Router } from 'express';
import { deleteProduct, getHistory, getLowStock, getProductById, getProducts, postProduct, postStock, putProduct } from '../controllers/product.controller.js';
import { requireAuth, requireNonEmployee } from '../middleware/auth.middleware.js';
export const productRouter = Router(); productRouter.use(requireAuth); productRouter.get('/', getProducts); productRouter.use(requireNonEmployee); productRouter.get('/low-stock', getLowStock); productRouter.get('/:id/history', getHistory); productRouter.get('/:id', getProductById); productRouter.post('/', postProduct); productRouter.put('/:id', putProduct); productRouter.delete('/:id', deleteProduct); productRouter.post('/:id/stock', postStock);
