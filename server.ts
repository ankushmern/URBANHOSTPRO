import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import { createServer as createViteServer } from 'vite';

import { connectDatabase } from './server/config/db';
import { config, validateEnv } from './server/config/env';
import authRoutes from './server/routes/authRoutes';
import bookingRoutes from './server/routes/bookingRoutes';
import dishRoutes from './server/routes/dishRoutes';
import inquiryRoutes from './server/routes/inquiryRoutes';
import uploadRoutes from './server/routes/uploadRoutes';
import paymentRoutes from './server/routes/paymentRoutes';
import adminRoutes from './server/routes/adminRoutes';
import docsRoutes from './server/routes/docsRoutes';
import userRoutes from './server/routes/userRoutes';
import reviewRoutes from './server/routes/reviewRoutes';
import healthRoutes from './server/routes/healthRoutes';
import { notFound, errorHandler } from './server/middleware/errorMiddleware';
import { requestIdMiddleware } from './server/middleware/requestIdMiddleware';
import { logger, morganStream } from './server/utils/logger';
import { runAllMigrations } from './server/migrations';
import { seedDatabaseFull } from './server/scripts/seedDatabase';
import { BackupService } from './server/services/backupService';

import { nosqlSanitizer, xssSanitizer, hppSanitizer, csrfProtection } from './server/middleware/securityMiddleware';

const app = express();
app.set('trust proxy', 1);
const PORT = Number(config.port) || 3000;

// Request ID & Correlation ID Middleware
app.use(requestIdMiddleware);

// Morgan HTTP Logger connected to Winston Stream
app.use(morgan(':method :url :status :res[content-length] - :response-time ms', { stream: morganStream }));

const isProd = config.nodeEnv === 'production';

// Global Security: Helmet & Content Security Policy (CSP)
app.use(
  helmet({
    frameguard: isProd ? { action: 'sameorigin' } : false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://unpkg.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com", "https://unpkg.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com", "data:"],
        imgSrc: ["'self'", "data:", "blob:", "https://images.unsplash.com", "https://lh3.googleusercontent.com"],
        connectSrc: ["'self'", "ws:", "wss:", "https:"],
        frameAncestors: isProd ? ["'none'"] : null,
        objectSrc: ["'none'"],
        upgradeInsecureRequests: isProd ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

const envAllowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const defaultDevOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

const productionOrigins = [
  'https://urbanhostpro.vercel.app',
  'https://urbanhostpro.onrender.com',
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (productionOrigins.includes(origin)) {
        return callback(null, true);
      }

      if (
        envAllowedOrigins.length > 0 &&
        envAllowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }

      if (!isProd && defaultDevOrigins.includes(origin)) {
        return callback(null, true);
      }

      if (
        origin.includes('.run.app') ||
        origin.includes('localhost')
      ) {
        return callback(null, true);
      }

      return callback(
        new Error(
          `CORS error: Origin '${origin}' is not allowed by security policy.`
        )
      );
    },

    credentials: true,

    methods: [
      'GET',
      'POST',
      'PUT',
      'DELETE',
      'PATCH',
      'OPTIONS',
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-CSRF-Token',
      'x-csrf-token',
    ],

    exposedHeaders: ['X-CSRF-Token'],
  })
);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many requests from this IP, please try again later.',
  },
});

app.use('/api/', apiLimiter);

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());

// Enterprise Security Sanitization & CSRF Protections
app.use(nosqlSanitizer);
app.use(xssSanitizer);
app.use(hppSanitizer);
app.use(csrfProtection);

// Initialize MongoDB Connection, Migrations, Seeding & Automated Backup Schedule
connectDatabase().then(async (connected) => {
  if (connected) {
    try {
      await runAllMigrations();
      await seedDatabaseFull();
      BackupService.scheduleAutomatedBackups(24);
    } catch (err) {
      logger.error('Error executing database startup tasks:', err);
    }
  }
});

// Health check & System Monitoring endpoints
app.use('/health', healthRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/v1/health', healthRoutes);
app.use('/api/metrics', healthRoutes);

// Primary REST API v1 Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/dishes', dishRoutes);
app.use('/api/v1/inquiries', inquiryRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/docs', docsRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/reviews', reviewRoutes);

// Legacy route aliases
app.use('/api/bookings', bookingRoutes);

// Vite Middleware for Frontend Serving
async function startServer() {
  validateEnv();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');

    // Serve frontend static files
    app.use(express.static(distPath));

    // SPA fallback
    app.use((req, res, next) => {
      if (
        req.method === 'GET' &&
        !req.path.startsWith('/api/')
      ) {
        res.sendFile(
          path.join(distPath, 'index.html'),
          (err) => {
            if (err) next(err);
          }
        );
      } else {
        next();
      }
    });
  }

  // 404 & Error Handlers
  app.use(notFound);
  app.use(errorHandler);

  app.listen(PORT, '0.0.0.0', () => {
    logger.info(
      `🚀 CookMantra Node.js + Express Backend active on http://0.0.0.0:${PORT}`
    );
  });
}

startServer();