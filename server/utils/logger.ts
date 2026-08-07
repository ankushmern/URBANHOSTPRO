import winston from 'winston';
import path from 'path';
import fs from 'fs';

const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  try {
    fs.mkdirSync(logsDir, { recursive: true });
  } catch (err) {
    // Graceful fallback if directory creation fails in restricted filesystems
  }
}

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, requestId, ...meta }) => {
    const reqStr = requestId ? `[ReqID: ${requestId}] ` : '';
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} ${level}: ${reqStr}${message}${metaStr}`;
  })
);

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: consoleFormat,
  }),
];

if (fs.existsSync(logsDir)) {
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: logFormat,
      maxsize: 5242880, // 5MB limit
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: logFormat,
      maxsize: 10485760, // 10MB limit
      maxFiles: 5,
    })
  );
}

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'cookmantra-api' },
  transports,
});

// Security Audit Logger
export const securityLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'cookmantra-security' },
  transports: [
    new winston.transports.Console({ format: consoleFormat }),
    ...(fs.existsSync(logsDir)
      ? [
          new winston.transports.File({
            filename: path.join(logsDir, 'security.log'),
            maxsize: 5242880,
            maxFiles: 5,
          }),
        ]
      : []),
  ],
});

// Stream for Morgan HTTP access logger
export const morganStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};
