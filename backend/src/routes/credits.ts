import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { creditService } from '../services/creditService';
import { validateGreenCreditPurchase } from '../utils/validators';

const router = Router();

// POST /api/green-credits/purchase - Purchase green credits
router.post(
  '/purchase',
  authMiddleware,
  requireRole('company'),
  asyncHandler(async (req: Request, res: Response) => {
    const data = req.body;
    validateGreenCreditPurchase(data);

    const purchase = await creditService.purchaseGreenCredits(
      req.user!.userId,
      data
    );

    res.status(201).json({
      success: true,
      message: 'Green credits purchased successfully',
      data: { purchase },
    });
  })
);

// GET /api/green-credits/balance - Get green credit balance
router.get(
  '/balance',
  authMiddleware,
  requireRole('company'),
  asyncHandler(async (req: Request, res: Response) => {
    const balance = await creditService.getGreenCreditBalance(req.user!.userId);

    res.status(200).json({
      success: true,
      message: 'Balance retrieved',
      data: { balance },
    });
  })
);

// GET /api/green-credits/history - Get allocation history
router.get(
  '/history',
  authMiddleware,
  requireRole('company'),
  asyncHandler(async (req: Request, res: Response) => {
    const history = await creditService.getGreenCreditHistory(req.user!.userId);

    res.status(200).json({
      success: true,
      message: 'History retrieved',
      data: { history },
    });
  })
);

// POST /api/green-credits/allocation - Allocate green credits to problem
router.post(
  '/allocation',
  authMiddleware,
  requireRole('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const data = req.body;

    await creditService.allocateGreenCredits(data);

    res.status(200).json({
      success: true,
      message: 'Green credits allocated',
    });
  })
);

export default router;
