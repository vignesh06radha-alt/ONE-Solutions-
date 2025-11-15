import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { n8nJobService } from '../services/n8nJobService';

const router = Router();

// POST /api/admin/n8n/jobs/:jobId/process - process a queued n8n job
router.post(
  '/jobs/:jobId/process',
  authMiddleware,
  requireRole('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const { jobId } = req.params;
    const result = await n8nJobService.processJob(jobId);
    res.status(200).json({ success: true, data: result });
  })
);

// GET /api/admin/n8n/jobs - list jobs (optional query: status, limit)
router.get(
  '/jobs',
  authMiddleware,
  requireRole('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const { status, limit } = req.query;
    const jobs = await n8nJobService.listJobs({
      status: status as string | undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    });
    res.status(200).json({ success: true, data: { jobs } });
  })
);

export default router;
