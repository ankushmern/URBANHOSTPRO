import mongoose from 'mongoose';
import { User } from '../models/User';
import { Booking } from '../models/Booking';
import { cursorPaginate } from '../utils/cursorPagination';
import { logger } from '../utils/logger';

export interface BenchmarkResult {
  testName: string;
  type: 'pagination' | 'index_search' | 'aggregation';
  durationMs: number;
  recordCount: number;
  details: string;
}

export async function benchmarkDatabaseQueries(): Promise<BenchmarkResult[]> {
  logger.info('Starting MongoDB query performance benchmark suite...');
  const results: BenchmarkResult[] = [];

  // 1. Pagination Test: Offset Skip/Limit vs Cursor Pagination
  const skipStart = performance.now();
  const offsetResults = await Booking.find({ isDeleted: false })
    .sort({ createdAt: -1 })
    .skip(10)
    .limit(10)
    .lean();
  const skipTime = performance.now() - skipStart;

  results.push({
    testName: 'Offset Skip/Limit Pagination (Page 2)',
    type: 'pagination',
    durationMs: Number(skipTime.toFixed(2)),
    recordCount: offsetResults.length,
    details: 'Traditional skip(10).limit(10) scan',
  });

  const cursorStart = performance.now();
  const cursorResults = await cursorPaginate(Booking, {
    query: { isDeleted: false },
    limit: 10,
    sortField: 'createdAt',
    sortOrder: 'desc',
  });
  const cursorTime = performance.now() - cursorStart;

  results.push({
    testName: 'Cursor-Based Pagination (Indexed Token)',
    type: 'pagination',
    durationMs: Number(cursorTime.toFixed(2)),
    recordCount: cursorResults.data.length,
    details: 'Key-set indexed lookup avoiding offset scan',
  });

  // 2. Index Search Test: Indexed Field vs Full Collection Regex
  const indexSearchStart = performance.now();
  const phoneResult = await User.findOne({ phone: '9876543210', isDeleted: false }).lean();
  const indexSearchTime = performance.now() - indexSearchStart;

  results.push({
    testName: 'Indexed Unique Field Query (Phone Lookup)',
    type: 'index_search',
    durationMs: Number(indexSearchTime.toFixed(2)),
    recordCount: phoneResult ? 1 : 0,
    details: 'B-tree index lookup on unique phone field',
  });

  const unindexedSearchStart = performance.now();
  const regexResult = await User.find({
    name: { $regex: 'Ankush', $options: 'i' },
    isDeleted: false,
  }).lean();
  const unindexedSearchTime = performance.now() - unindexedSearchStart;

  results.push({
    testName: 'Unindexed Regex Name Search',
    type: 'index_search',
    durationMs: Number(unindexedSearchTime.toFixed(2)),
    recordCount: regexResult.length,
    details: 'Case-insensitive regex search requiring document inspection',
  });

  // 3. Aggregation Pipeline Test: Optimized $match -> $group pipeline
  const aggStart = performance.now();
  const aggResult = await Booking.aggregate([
    { $match: { isDeleted: false, status: 'Confirmed' } },
    { $group: { _id: '$serviceType', totalRevenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
    { $sort: { totalRevenue: -1 } },
  ]);
  const aggTime = performance.now() - aggStart;

  results.push({
    testName: 'Optimized Revenue Aggregation Pipeline',
    type: 'aggregation',
    durationMs: Number(aggTime.toFixed(2)),
    recordCount: aggResult.length,
    details: 'Early indexed $match filter followed by in-memory grouping',
  });

  logger.info('Database performance benchmark completed.');
  return results;
}
