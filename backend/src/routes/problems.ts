import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { problemService } from '../services/problemService';
import { validateProblemInput } from '../utils/validators';
import { CreateProblemRequest } from '../types/problem';

const router = Router();

// POST /api/problems - Create new problem
router.post(
  '/',
  authMiddleware,
  requireRole('public', 'company', 'contractor'),
  asyncHandler(async (req: Request, res: Response) => {
    const data: CreateProblemRequest = req.body;
    validateProblemInput(data);

    const problem = await problemService.createProblem(req.user!.userId, data);

    res.status(201).json({
      success: true,
      message: 'Problem reported successfully',
      data: { problem },
    });
  })
);

// GET /api/problems/mine - Get user's problems
router.get(
  '/mine',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const problems = await problemService.getUserProblems(req.user!.userId);

    res.status(200).json({
      success: true,
      message: 'Problems retrieved',
      data: { problems },
    });
  })
);

// GET /api/problems/:id - Get problem details
router.get(
  '/:id',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const problem = await problemService.getProblemById(id);

    if (!problem) {
      return res.status(404).json({
        success: false,
        error: 'Problem not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Problem retrieved',
      data: { problem },
    });
  })
);

// GET /api/problems/open - Get open problems (contractors)
router.get(
  '/open',
  authMiddleware,
  requireRole('contractor'),
  asyncHandler(async (req: Request, res: Response) => {
    const { domain } = req.query;
    const problems = await problemService.getOpenProblems(domain as string);

    res.status(200).json({
      success: true,
      message: 'Open problems retrieved',
      data: { problems },
    });
  })
);

// PATCH /api/problems/:id/status - Update problem status
router.patch(
  '/:id/status',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    await problemService.updateProblemStatus(id, status);

    res.status(200).json({
      success: true,
      message: 'Problem status updated',
    });
  })
);

export default router;
