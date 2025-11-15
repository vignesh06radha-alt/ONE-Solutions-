import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/errors';

export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions for this resource',
      });
    }

    next();
  };
};

export const requireAnyRole = (...allowedRoles: string[]) => {
  return requireRole(...allowedRoles);
};
