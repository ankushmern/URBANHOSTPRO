import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const existingId = req.headers['x-request-id'] as string || req.headers['x-correlation-id'] as string;
  const requestId = existingId || `req_${crypto.randomBytes(8).toString('hex')}`;

  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  res.setHeader('X-Correlation-ID', requestId);

  next();
};
