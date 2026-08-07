import mongoose, { ClientSession } from 'mongoose';
import { logger } from './logger';

/**
 * Executes a callback within an atomic MongoDB Transaction.
 * Supports fallback execution for standalone non-replica-set environments.
 */
export async function executeTransaction<T>(
  callback: (session: ClientSession | null) => Promise<T>
): Promise<T> {
  if (mongoose.connection.readyState !== 1) {
    logger.warn('MongoDB not connected; executing operation non-transactionally.');
    return await callback(null);
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const result = await callback(session);
    await session.commitTransaction();
    return result;
  } catch (error: any) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    // Check if error is due to MongoDB running as standalone (no replica set)
    const isReplicaSetError =
      error?.message?.includes('Transaction numbers are only allowed on a replica set member') ||
      error?.message?.includes('This MongoDB deployment does not support transactions') ||
      error?.message?.includes('This MongoDB deployment does not support retryable writes') ||
      error?.message?.includes('retryable writes') ||
      error?.code === 20;

    if (isReplicaSetError) {
      logger.warn('MongoDB transactions not supported on current topology; falling back to non-transactional execution');
      return await callback(null);
    }

    logger.error('Transaction failed and aborted:', error);
    throw error;
  } finally {
    session.endSession();
  }
}
