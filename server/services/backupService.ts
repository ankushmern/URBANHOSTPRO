import fs from 'fs';
import path from 'path';
import { User } from '../models/User';
import { Booking } from '../models/Booking';
import { Payment } from '../models/Payment';
import { Review } from '../models/Review';
import { Dish } from '../models/Dish';
import { Inquiry } from '../models/Inquiry';
import { AuditLog } from '../models/AuditLog';
import { logger } from '../utils/logger';

export interface BackupMetadata {
  id: string;
  filename: string;
  timestamp: string;
  counts: Record<string, number>;
  sizeBytes: number;
}

export class BackupService {
  private static BACKUP_DIR = path.join(process.cwd(), 'server', 'backups');
  private static MAX_BACKUPS = 7;

  /**
   * Generates a complete JSON backup dump of all database collections.
   */
  public static async createBackup(): Promise<BackupMetadata> {
    if (!fs.existsSync(this.BACKUP_DIR)) {
      fs.mkdirSync(this.BACKUP_DIR, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupId = `backup_${timestamp}`;
    const filename = `${backupId}.json`;
    const filepath = path.join(this.BACKUP_DIR, filename);

    logger.info(`Starting database backup generation: ${backupId}`);

    const users = await User.find({}).lean();
    const bookings = await Booking.find({}).lean();
    const payments = await Payment.find({}).lean();
    const reviews = await Review.find({}).lean();
    const dishes = await Dish.find({}).lean();
    const inquiries = await Inquiry.find({}).lean();
    const auditLogs = await AuditLog.find({}).lean();

    const dumpData = {
      version: '1.0',
      createdAt: new Date().toISOString(),
      collections: {
        users,
        bookings,
        payments,
        reviews,
        dishes,
        inquiries,
        auditLogs,
      },
    };

    const jsonString = JSON.stringify(dumpData, null, 2);
    fs.writeFileSync(filepath, jsonString, 'utf8');

    const sizeBytes = fs.statSync(filepath).size;

    const metadata: BackupMetadata = {
      id: backupId,
      filename,
      timestamp: new Date().toISOString(),
      counts: {
        users: users.length,
        bookings: bookings.length,
        payments: payments.length,
        reviews: reviews.length,
        dishes: dishes.length,
        inquiries: inquiries.length,
        auditLogs: auditLogs.length,
      },
      sizeBytes,
    };

    logger.info(`Database backup successfully saved (${sizeBytes} bytes) to ${filename}`);

    // Rotate older backups
    await this.rotateBackups();

    return metadata;
  }

  /**
   * Rotates backups to maintain only the latest N backups
   */
  private static async rotateBackups(): Promise<void> {
    if (!fs.existsSync(this.BACKUP_DIR)) return;

    const files = fs
      .readdirSync(this.BACKUP_DIR)
      .filter((file) => file.endsWith('.json'))
      .map((file) => ({
        file,
        filepath: path.join(this.BACKUP_DIR, file),
        ctime: fs.statSync(path.join(this.BACKUP_DIR, file)).ctimeMs,
      }))
      .sort((a, b) => b.ctime - a.ctime);

    if (files.length > this.MAX_BACKUPS) {
      const toDelete = files.slice(this.MAX_BACKUPS);
      for (const item of toDelete) {
        try {
          fs.unlinkSync(item.filepath);
          logger.info(`Rotated and deleted old backup file: ${item.file}`);
        } catch (err) {
          logger.error(`Failed to delete backup file ${item.file}:`, err);
        }
      }
    }
  }

  /**
   * Schedules automated background backups every N hours
   */
  public static scheduleAutomatedBackups(intervalHours = 24): void {
    const intervalMs = intervalHours * 60 * 60 * 1000;
    logger.info(`Automated database backups scheduled every ${intervalHours} hours.`);
    setInterval(async () => {
      try {
        await this.createBackup();
      } catch (err) {
        logger.error('Automated backup execution failed:', err);
      }
    }, intervalMs);
  }

  /**
   * Lists all existing backups
   */
  public static async listBackups(): Promise<BackupMetadata[]> {
    if (!fs.existsSync(this.BACKUP_DIR)) return [];

    const files = fs
      .readdirSync(this.BACKUP_DIR)
      .filter((file) => file.endsWith('.json'));

    const list: BackupMetadata[] = [];

    for (const file of files) {
      const filepath = path.join(this.BACKUP_DIR, file);
      const stat = fs.statSync(filepath);
      try {
        const content = fs.readFileSync(filepath, 'utf8');
        const parsed = JSON.parse(content);

        list.push({
          id: file.replace('.json', ''),
          filename: file,
          timestamp: parsed.createdAt || stat.ctime.toISOString(),
          counts: {
            users: parsed.collections?.users?.length || 0,
            bookings: parsed.collections?.bookings?.length || 0,
            payments: parsed.collections?.payments?.length || 0,
            reviews: parsed.collections?.reviews?.length || 0,
            dishes: parsed.collections?.dishes?.length || 0,
            inquiries: parsed.collections?.inquiries?.length || 0,
            auditLogs: parsed.collections?.auditLogs?.length || 0,
          },
          sizeBytes: stat.size,
        });
      } catch (err) {
        // Skip invalid backup JSON files
      }
    }

    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}
