import { MigrationRunner } from './runner';
import { migration001 } from './001_add_soft_delete_and_indexes';
import { migration002 } from './002_normalize_user_phones';
import { migration003 } from './003_cleanup_duplicate_records';
import { logger } from '../utils/logger';

export async function runAllMigrations() {
  const runner = new MigrationRunner();
  runner.register(migration001);
  runner.register(migration002);
  runner.register(migration003);

  try {
    const result = await runner.runPending();
    logger.info(`Migrations completion: ${result.applied.length} applied, ${result.skipped.length} skipped.`);
    return result;
  } catch (err) {
    logger.error('Failed to execute database migrations:', err);
    throw err;
  }
}
