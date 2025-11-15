import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authMiddleware } from '../middleware/auth';
import { authService } from '../services/authService';
import { logger } from '../utils/logger';

const router = Router();

// POST /api/auth/register
router.post(
  '/register',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password, displayName, role } = req.body;

    const { user, token } = await authService.register(
      email,
      password,
      displayName,
      role
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { user, token },
    });
  })
);

// POST /api/auth/login
router.post(
  '/login',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const { user, token } = await authService.login(email, password);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { user, token },
    });
  })
);

// POST /api/auth/refresh
router.post(
  '/refresh',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const token = await authService.refreshToken(req.user!.userId);

    res.status(200).json({
      success: true,
      message: 'Token refreshed',
      data: { token },
    });
  })
);

// POST /api/auth/logout
router.post(
  '/logout',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    logger.info(`User logged out: ${req.user?.userId}`);
    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  })
);

export default router;
