import { Router } from 'express';
import authRoutes from './auth';
import problemRoutes from './problems';
import bidRoutes from './bids';
import contractorRoutes from './contractors';
import creditRoutes from './credits';
import rewardRoutes from './rewards';
import adminN8nRoutes from './adminN8n';

const router = Router();

router.use('/auth', authRoutes);
router.use('/problems', problemRoutes);
router.use('/bids', bidRoutes);
router.use('/contractors', contractorRoutes);
router.use('/green-credits', creditRoutes);
router.use('/rewards', rewardRoutes);
router.use('/admin/n8n', adminN8nRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

export default router;
