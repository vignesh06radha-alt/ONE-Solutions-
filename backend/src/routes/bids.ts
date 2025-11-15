import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { biddingService } from '../services/biddingService';
import { validateBidInput } from '../utils/validators';
import { CreateBidRequest } from '../types/bidding';

const router = Router();

// POST /api/bids - Submit bid
router.post(
  '/',
  authMiddleware,
  requireRole('contractor'),
  asyncHandler(async (req: Request, res: Response) => {
    const data: CreateBidRequest = req.body;
    validateBidInput(data);

    const bid = await biddingService.submitBid(req.user!.userId, data);

    res.status(201).json({
      success: true,
      message: 'Bid submitted successfully',
      data: { bid },
    });
  })
);

// GET /api/bids/problem/:problemId - Get bids for problem
router.get(
  '/problem/:problemId',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { problemId } = req.params;
    const bids = await biddingService.getBidsForProblem(problemId);

    res.status(200).json({
      success: true,
      message: 'Bids retrieved',
      data: { bids },
    });
  })
);

// POST /api/bids/:sessionId/select - Select winning bid
router.post(
  '/:sessionId/select',
  authMiddleware,
  requireRole('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const { sessionId } = req.params;
    await biddingService.selectWinningBid(sessionId);

    res.status(200).json({
      success: true,
      message: 'Winning bid selected',
    });
  })
);

export default router;
