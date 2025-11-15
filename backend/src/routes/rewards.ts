import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { redemptionService } from '../services/redemptionService';
import { problemService } from '../services/problemService';
import { optionalAuth } from '../middleware/auth';

const router = Router();

// GET /api/rewards/list - List available rewards
router.get(
  '/list',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const rewards = await redemptionService.listAvailableRewards();

    res.status(200).json({
      success: true,
      message: 'Rewards retrieved',
      data: { rewards },
    });
  })
);

// POST /api/rewards/redeem - Redeem reward
router.post(
  '/redeem',
  authMiddleware,
  requireRole('public', 'company', 'contractor'),
  asyncHandler(async (req: Request, res: Response) => {
    const { rewardId } = req.body;

    const redemption = await redemptionService.redeemReward(
      req.user!.userId,
      rewardId
    );

    res.status(201).json({
      success: true,
      message: 'Reward redeemed successfully',
      data: { redemption },
    });
  })
);

// GET /api/rewards/history - Get redemption history
router.get(
  '/history',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const history = await redemptionService.getRedemptionHistory(req.user!.userId);

    res.status(200).json({
      success: true,
      message: 'Redemption history retrieved',
      data: { history },
    });
  })
);

// GET /api/heatmap - Get heatmap data
router.get(
  '/heatmap',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { neLat, neLng, swLat, swLng } = req.query;

    let bounds;
    if (neLat && neLng && swLat && swLng) {
      bounds = {
        ne: { lat: parseFloat(neLat as string), lng: parseFloat(neLng as string) },
        sw: { lat: parseFloat(swLat as string), lng: parseFloat(swLng as string) },
      };
    }

    const heatmapData = await problemService.getHeatmapData(bounds);

    res.status(200).json({
      success: true,
      message: 'Heatmap data retrieved',
      data: { heatmapData },
    });
  })
);

export default router;
