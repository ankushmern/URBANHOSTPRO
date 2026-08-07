import mongoose, { Schema } from 'mongoose';
import { logger } from '../utils/logger';

interface IMigrationRecord {
  name: string;
  appliedAt: Date;
}

const MigrationSchema = new Schema<IMigrationRecord>({
  name: { type: String, required: true, unique: true },
  appliedAt: { type: Date, default: Date.now },
});

const MigrationRecord = mongoose.model<IMigrationRecord>('_migrations', MigrationSchema);

export interface MigrationScript {
  name: string;
  up: () => Promise<void>;
  down?: () => Promise<void>;
}

export class MigrationRunner {
  private migrations: MigrationScript[] = [];

  public register(migration: MigrationScript): void {
    this.migrations.push(migration);
  }

  public async runPending(): Promise<{ applied: string[]; skipped: string[] }> {
    const applied: string[] = [];
    const skipped: string[] = [];

    const executed = await MigrationRecord.find({}).lean();
    const executedNames = new Set(executed.map((m) => m.name));

    for (const migration of this.migrations) {
      if (executedNames.has(migration.name)) {
        skipped.push(migration.name);
        continue;
      }

      logger.info(`Running database migration: ${migration.name}...`);
      try {
        await migration.up();
        await MigrationRecord.create({ name: migration.name, appliedAt: new Date() });
        applied.push(migration.name);
        logger.info(`Migration '${migration.name}' applied successfully.`);
      } catch (err) {
        logger.error(`Migration '${migration.name}' failed:`, err);
        throw err;
      }
    }

    return { applied, skipped };
  }
}
