import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { AppError } from '../utils/AppError.js';

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(`Resource Not Found - ${req.originalUrl}`, 404, 'NOT_FOUND');
  next(error);
};

export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction): void => {
  let statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  let message = err.message || 'An unexpected server error occurred.';
  let errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';
  let errors = err.errors || undefined;

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Database validation failed';
    errors = Object.values(err.errors).map((e: any) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Handle Duplicate Key Error (MongoDB Code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    errorCode = 'DUPLICATE_KEY_ERROR';
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value entered for ${field}.`;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorCode = 'UNAUTHORIZED';
    message = 'Invalid authorization token.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorCode = 'TOKEN_EXPIRED';
    message = 'Authorization token has expired.';
  }

  logger.error(`💥 [API Error] ${req.method} ${req.originalUrl} - Status: ${statusCode} - ${message}`, {
    requestId: req.requestId,
    stack: err.stack,
    errors,
  });

  res.status(statusCode).json({
    success: false,
    message,
    code: errorCode,
    requestId: req.requestId || null,
    errors,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};
