import mongoose from 'mongoose';
import { User } from '../models/User';
import { Booking } from '../models/Booking';
import { Payment } from '../models/Payment';
import { Review } from '../models/Review';
import { Dish } from '../models/Dish';
import { Inquiry } from '../models/Inquiry';
import { AuditLog } from '../models/AuditLog';

export interface CollectionHealthStats {
  name: string;
  totalDocs: number;
  activeDocs: number;
  softDeletedDocs: number;
  indexCount: number;
}

export interface DatabaseHealthReport {
  status: 'healthy' | 'degraded' | 'unhealthy';
  connectionState: string;
  pingMs: number;
  timestamp: string;
  uptimeSeconds: number;
  collections: CollectionHealthStats[];
  recommendations: string[];
}

export class DbMonitorService {
  /**
   * Executes health check diagnostics on MongoDB
   */
  public static async getHealthReport(): Promise<DatabaseHealthReport> {
    const startTime = Date.now();
    const recommendations: string[] = [];

    // Connection states: 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
    const stateMap: Record<number, string> = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    const currentStateCode = mongoose.connection.readyState;
    const connectionState = stateMap[currentStateCode] || 'unknown';

    let pingMs = -1;
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (currentStateCode !== 1) {
      status = 'unhealthy';
      recommendations.push('MongoDB connection is not active.');
    } else {
      try {
        if (mongoose.connection.db) {
          await mongoose.connection.db.admin().ping();
          pingMs = Date.now() - startTime;
        }
      } catch (err) {
        status = 'degraded';
        recommendations.push('MongoDB ping failed or timed out.');
      }
    }

    if (pingMs > 200) {
      status = 'degraded';
      recommendations.push(`High database latency detected (${pingMs}ms). Check database network or load.`);
    }

    // Inspect Collections Stats
    const collectionsStats: CollectionHealthStats[] = [];

    const models = [
      { name: 'users', model: User },
      { name: 'bookings', model: Booking },
      { name: 'payments', model: Payment },
      { name: 'reviews', model: Review },
      { name: 'dishes', model: Dish },
      { name: 'inquiries', model: Inquiry },
      { name: 'auditlogs', model: AuditLog },
    ];

    for (const item of models) {
      try {
        const totalDocs = await (item.model as any).countDocuments({});
        const activeDocs = await (item.model as any).countDocuments({ isDeleted: false });
        const softDeletedDocs = totalDocs - activeDocs;
        const indexes = await item.model.collection.indexes();

        collectionsStats.push({
          name: item.name,
          totalDocs,
          activeDocs,
          softDeletedDocs,
          indexCount: indexes.length,
        });

        if (softDeletedDocs > 1000) {
          recommendations.push(`Collection '${item.name}' has ${softDeletedDocs} soft-deleted records. Consider running cleanup.`);
        }
      } catch (err) {
        collectionsStats.push({
          name: item.name,
          totalDocs: 0,
          activeDocs: 0,
          softDeletedDocs: 0,
          indexCount: 0,
        });
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('Database operations operating within optimal performance parameters.');
    }

    return {
      status,
      connectionState,
      pingMs,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      collections: collectionsStats,
      recommendations,
    };
  }
}

export const getDatabaseHealthReport = () => DbMonitorService.getHealthReport();
