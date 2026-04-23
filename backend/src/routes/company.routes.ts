import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import {
  createProduct,
  getCompanyProducts,
  updateProduct,
  deleteProduct,
  verifyProduct,
  getCompanyInvestments,
  confirmProductDelivery,
  getCompanyStats,
} from '../controllers/company.controller';

const router = Router();
router.use(authenticate, requireRole('COMPANY'));

router.get('/stats', getCompanyStats);
router.get('/products', getCompanyProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.post('/products/:id/verify', verifyProduct);
router.get('/investments', getCompanyInvestments);
router.post('/investments/:id/confirm-delivery', confirmProductDelivery);

export default router;
