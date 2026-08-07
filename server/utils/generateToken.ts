import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { config } from '../config/env.js';
import crypto from 'crypto';

export const generateCsrfToken = (): string => {
  return crypto.randomBytes(24).toString('hex');
};

export const generateAccessToken = (userId: string, role: string = 'user'): string => {
  return jwt.sign(
    { id: userId, role, type: 'access' },
    config.jwtSecret,
    { expiresIn: '15m' }
  );
};

export const generateRefreshToken = (userId: string, role: string = 'user'): string => {
  return jwt.sign(
    { id: userId, role, type: 'refresh' },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
};

// Legacy backward compatibility alias
export const generateToken = generateAccessToken;

export const sendAuthCookies = (res: Response, accessToken: string, refreshToken: string, customCsrfToken?: string): string => {
  const isProduction = config.nodeEnv === 'production';
  const csrfToken = customCsrfToken || generateCsrfToken();

  // Access Token Cookie (15 mins)
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000,
  });

  // Refresh Token Cookie (7 days)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  // Double-Submit CSRF Token Cookie (readable by client JS)
  res.cookie('csrfToken', csrfToken, {
    httpOnly: false,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return csrfToken;
};

export const clearAuthCookies = (res: Response) => {
  const isProduction = config.nodeEnv === 'production';
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
  });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
  });
  res.clearCookie('csrfToken', {
    httpOnly: false,
    secure: isProduction,
    sameSite: 'lax',
  });
};


