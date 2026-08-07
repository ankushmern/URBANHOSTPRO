import { Router, Request, Response } from 'express';
import os from 'os';
import { getMongoStatus } from '../config/db';
import { DbMonitorService } from '../services/dbMonitorService';

const router = Router();

// Basic health check
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'CookMantra API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

// Extended system health monitoring
router.get('/health/extended', async (_req: Request, res: Response) => {
  const memUsage = process.memoryUsage();
  const cpus = os.cpus();
  const loadAvg = os.loadavg();

  const memoryStats = {
    rssMb: +(memUsage.rss / 1024 / 1024).toFixed(2),
    heapTotalMb: +(memUsage.heapTotal / 1024 / 1024).toFixed(2),
    heapUsedMb: +(memUsage.heapUsed / 1024 / 1024).toFixed(2),
    externalMb: +(memUsage.external / 1024 / 1024).toFixed(2),
    systemTotalMemMb: +(os.totalmem() / 1024 / 1024).toFixed(2),
    systemFreeMemMb: +(os.freemem() / 1024 / 1024).toFixed(2),
  };

  const cpuStats = {
    cores: cpus.length,
    model: cpus[0]?.model || 'Unknown',
    loadAverage: loadAvg,
    processCpuUsage: process.cpuUsage(),
  };

  const dbStatus = getMongoStatus();

  res.json({
    status: dbStatus.isConnected ? 'healthy' : 'degraded',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    memory: memoryStats,
    cpu: cpuStats,
    database: dbStatus,
  });
});

// Database specific health & diagnostic report
router.get('/health/db', async (_req: Request, res: Response) => {
  try {
    const report = await DbMonitorService.getHealthReport();
    res.json(report);
  } catch (error: any) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message || 'Failed to fetch database health report',
    });
  }
});

// System Metrics endpoint (JSON format)
router.get('/metrics', (_req: Request, res: Response) => {
  const memUsage = process.memoryUsage();
  const metrics = {
    cookmantra_uptime_seconds: process.uptime(),
    cookmantra_memory_rss_bytes: memUsage.rss,
    cookmantra_memory_heap_total_bytes: memUsage.heapTotal,
    cookmantra_memory_heap_used_bytes: memUsage.heapUsed,
    cookmantra_system_load_1m: os.loadavg()[0],
    cookmantra_system_load_5m: os.loadavg()[1],
    cookmantra_system_load_15m: os.loadavg()[2],
    cookmantra_cpu_count: os.cpus().length,
  };

  res.json(metrics);
});

export default router;
