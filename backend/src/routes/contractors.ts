import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { userService } from '../services/userService';
import { validateContractorRegistration } from '../utils/validators';

const router = Router();

// POST /api/contractors/register - Register contractor
router.post(
  '/register',
  authMiddleware,
  requireRole('contractor'),
  asyncHandler(async (req: Request, res: Response) => {
    const { domain, serviceAreas } = req.body;
    validateContractorRegistration({ domain, serviceAreas });

    const contractor = await userService.registerContractor(
      req.user!.userId,
      domain,
      serviceAreas
    );

    res.status(201).json({
      success: true,
      message: 'Contractor registered successfully',
      data: { contractor },
    });
  })
);

// GET /api/contractors/:id - Get contractor profile
router.get(
  '/:id',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const contractor = await userService.getUserById(id);

    if (!contractor) {
      return res.status(404).json({
        success: false,
        error: 'Contractor not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contractor retrieved',
      data: { contractor },
    });
  })
);

// GET /api/contractors/domain/:domain - List contractors by domain
router.get(
  '/domain/:domain',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { domain } = req.params;
    const contractors = await userService.getContractorsByDomain(domain);

    res.status(200).json({
      success: true,
      message: 'Contractors retrieved',
      data: { contractors },
    });
  })
);

export default router;
