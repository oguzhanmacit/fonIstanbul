import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { verifyInvoice, processPayments, addSaleData } from '../controllers/admin.controller';

const router = Router();
router.use(authenticate, requireRole('COMPANY'));

router.post('/invoices/:id/verify', verifyInvoice);
router.post('/payments/process', processPayments);
router.post('/products/:id/sales', addSaleData);

export default router;
