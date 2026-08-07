import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = (error.issues || []).map((err) => ({
          field: err.path.slice(1).join('.'), // strip 'body', 'query', or 'params'
          message: err.message,
        }));

        const firstMsg = formattedErrors[0]?.message || 'Validation failed';
        next(new AppError(firstMsg, 400, 'VALIDATION_ERROR', formattedErrors));
      } else {
        next(error);
      }
    }
  };
};

// Legacy middleware helpers for backward compatibility
export const validateUserRegistration = (req: Request, res: Response, next: NextFunction): void => {
  const { name, phone } = req.body;
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    res.status(400).json({ success: false, message: 'Name is required and must be at least 2 characters long.' });
    return;
  }
  if (!phone || typeof phone !== 'string' || !/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
    res.status(400).json({ success: false, message: 'Valid 10-digit mobile phone number is required.' });
    return;
  }
  next();
};

export const validateBookingInput = (req: Request, res: Response, next: NextFunction): void => {
  const { name, phone, serviceDetail } = req.body;
  if (!name || name.trim().length === 0) {
    res.status(400).json({ success: false, message: 'Customer name is required.' });
    return;
  }
  if (!phone || phone.trim().length < 10) {
    res.status(400).json({ success: false, message: 'Valid 10-digit phone number is required.' });
    return;
  }
  if (!serviceDetail || serviceDetail.trim().length === 0) {
    res.status(400).json({ success: false, message: 'Service detail or selected dish is required.' });
    return;
  }
  next();
};
