import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import {
  invest,
  getMyInvestments,
  getMyProfits,
  uploadInvoice,
  getMyStats,
  getProductDetail,
} from '../controllers/investor.controller';

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, ['.pdf', '.xml', '.jpg', '.png'].includes(ext));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

const router = Router();
router.use(authenticate, requireRole('INVESTOR'));

router.get('/stats', getMyStats);
router.post('/invest', invest);
router.get('/investments', getMyInvestments);
router.get('/profits', getMyProfits);
router.post('/invoices', upload.single('invoice'), uploadInvoice);
router.get('/products/:productId', getProductDetail);

export default router;
