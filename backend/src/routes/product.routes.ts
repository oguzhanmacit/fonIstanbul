import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getOpenProducts, getProductDetail, getProductSales } from '../controllers/product.controller';

const router = Router();

router.get('/', authenticate, getOpenProducts);
router.get('/:id', authenticate, getProductDetail);
router.get('/:id/sales', authenticate, getProductSales);

export default router;
