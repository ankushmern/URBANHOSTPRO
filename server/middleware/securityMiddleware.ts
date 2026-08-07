import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

/**
 * Sanitizes input objects against MongoDB / NoSQL injection in-place.
 * Removes keys starting with '$' or containing '.' in req.body, req.query, and req.params.
 */
const sanitizeNoSQLInPlace = (obj: any): void => {
  if (obj === null || typeof obj !== 'object') {
    return;
  }

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      if (typeof obj[i] === 'object' && obj[i] !== null) {
        sanitizeNoSQLInPlace(obj[i]);
      }
    }
    return;
  }

  const keys = Object.keys(obj);
  for (const key of keys) {
    if (key.startsWith('$') || key.includes('.')) {
      logger.warn(`🛡️ [Security] NoSQL Injection attempt detected and blocked: Key '${key}'`);
      delete obj[key];
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeNoSQLInPlace(obj[key]);
    }
  }
};

export const nosqlSanitizer = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body) sanitizeNoSQLInPlace(req.body);
  if (req.query) sanitizeNoSQLInPlace(req.query);
  if (req.params) sanitizeNoSQLInPlace(req.params);
  next();
};

/**
 * Basic XSS sanitizer for string inputs to prevent script injection in stored fields
 */
const sanitizeXSSString = (str: string): string => {
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/onerror=/gi, 'on-error-disabled=')
    .replace(/onload=/gi, 'on-load-disabled=')
    .replace(/onclick=/gi, 'on-click-disabled=');
};

const sanitizeXSSInPlace = (obj: any): void => {
  if (obj === null || typeof obj !== 'object') {
    return;
  }

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      if (typeof obj[i] === 'string') {
        obj[i] = sanitizeXSSString(obj[i]);
      } else if (typeof obj[i] === 'object' && obj[i] !== null) {
        sanitizeXSSInPlace(obj[i]);
      }
    }
    return;
  }

  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'string') {
      obj[key] = sanitizeXSSString(obj[key]);
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeXSSInPlace(obj[key]);
    }
  }
};

export const xssSanitizer = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body) sanitizeXSSInPlace(req.body);
  if (req.query) sanitizeXSSInPlace(req.query);
  if (req.params) sanitizeXSSInPlace(req.params);
  next();
};

/**
 * HTTP Parameter Pollution (HPP) Middleware
 * Prevents multiple query parameter arrays from confusing backend logic
 */
export const hppSanitizer = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.query) {
    for (const key of Object.keys(req.query)) {
      if (Array.isArray(req.query[key]) && key !== 'status' && key !== 'tags') {
        // Take last value if polluted array is supplied
        const arr = req.query[key] as any[];
        req.query[key] = arr[arr.length - 1];
      }
    }
  }
  next();
};

/**
 * Anti-CSRF verification middleware for state-changing requests when authenticated via cookies
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction): void => {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Check if cookies are used for authentication
  const hasAuthCookie = req.cookies && (req.cookies.accessToken || req.cookies.refreshToken);
  if (!hasAuthCookie) {
    // If not using cookie auth (e.g. Bearer header or public API), CSRF check is passed
    return next();
  }

  // Verify CSRF Custom Header presence (Double Submit Cookie or Custom Header Pattern)
  const csrfHeader = req.headers['x-requested-with'] || req.headers['x-csrf-token'];
  if (!csrfHeader) {
    logger.warn(`🛡️ [Security] CSRF protection trigger on ${req.method} ${req.originalUrl}`);
    res.status(403).json({
      success: false,
      message: 'CSRF validation failed. Missing security request header.',
    });
    return;
  }

  // If both csrfToken cookie and x-csrf-token header are present, verify double submit match
  const csrfCookie = req.cookies && req.cookies.csrfToken;
  const csrfTokenHeader = req.headers['x-csrf-token'];
  if (csrfCookie && csrfTokenHeader && csrfCookie !== csrfTokenHeader) {
    logger.warn(`🛡️ [Security] CSRF token mismatch on ${req.method} ${req.originalUrl}`);
    res.status(403).json({
      success: false,
      message: 'CSRF validation failed. Token mismatch.',
    });
    return;
  }

  next();
};
