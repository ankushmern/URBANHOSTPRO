import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { User, IUser } from '../models/User.js';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Access denied. Authorization token missing or invalid.',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string; role: string; type?: string };

    // Find user in MongoDB
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User account no longer exists.',
      });
      return;
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      res.status(423).json({
        success: false,
        message: 'Account is locked due to multiple failed login attempts. Please try again later or reset password.',
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token expired or invalid. Please log in or refresh your session.',
    });
  }
};

export const adminOnly = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Permission denied. Admin privileges required.',
    });
  }
};
