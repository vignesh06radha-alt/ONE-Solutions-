import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { environment } from '../config/environment';
import { UnauthorizedError } from '../utils/errors';
import { JwtPayload } from '../types/user';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, environment.JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      res.status(401).json({ success: false, error: error.message });
    } else {
      res.status(401).json({ success: false, error: 'Invalid token' });
    }
  }
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, environment.JWT_SECRET) as JwtPayload;
      req.user = decoded;
    }
    next();
  } catch (error) {
    // If token is invalid, just continue without user context
    next();
  }
};
