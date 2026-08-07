import { Model } from 'mongoose';

export type FilterQuery<T> = Record<string, any>;

export interface CursorPaginateOptions<T> {
  query?: FilterQuery<T>;
  limit?: number;
  cursor?: string; // Base64 encoded token
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  select?: string;
  populate?: any;
}

export interface CursorPaginateResult<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
  totalCount?: number;
}

/**
 * High-performance cursor-based pagination utility for Mongoose models.
 * Avoids O(N) memory scans associated with MongoDB offset/skip queries.
 */
export async function cursorPaginate<T = any>(
  model: Model<any>,
  options: CursorPaginateOptions<T> = {}
): Promise<CursorPaginateResult<T>> {
  const {
    query = {},
    limit = 10,
    cursor,
    sortField = '_id',
    sortOrder = 'desc',
    select,
    populate,
  } = options;

  // Enforce active documents by default unless explicit isDeleted filter provided
  const baseFilter: FilterQuery<any> = {
    isDeleted: false,
    ...query,
  };

  const isDesc = sortOrder === 'desc';
  const comparator = isDesc ? '$lt' : '$gt';

  // Decode cursor if provided
  if (cursor) {
    try {
      const decodedJson = Buffer.from(cursor, 'base64').toString('utf8');
      const decoded = JSON.parse(decodedJson);

      if (sortField === '_id') {
        baseFilter._id = { [comparator]: decoded.id };
      } else {
        const cursorVal = decoded.val;
        const cursorId = decoded.id;

        baseFilter.$or = [
          { [sortField]: { [comparator]: cursorVal } },
          {
            [sortField]: cursorVal,
            _id: { [comparator]: cursorId },
          },
        ];
      }
    } catch (err) {
      // Invalid cursor provided, fall back to initial page
    }
  }

  // Determine sort configuration
  const sortConfig: Record<string, 1 | -1> = {};
  if (sortField !== '_id') {
    sortConfig[sortField] = isDesc ? -1 : 1;
  }
  sortConfig._id = isDesc ? -1 : 1;

  // Execute query with limit + 1 to check for hasMore
  let dbQuery = model.find(baseFilter).sort(sortConfig).limit(limit + 1);

  if (select) {
    dbQuery = dbQuery.select(select);
  }

  if (populate) {
    dbQuery = dbQuery.populate(populate);
  }

  const results = await dbQuery.lean();

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;

  let nextCursor: string | null = null;
  if (hasMore && data.length > 0) {
    const lastItem: any = data[data.length - 1];
    const cursorPayload = {
      id: lastItem._id.toString(),
      val: sortField !== '_id' ? lastItem[sortField] : undefined,
    };
    nextCursor = Buffer.from(JSON.stringify(cursorPayload)).toString('base64');
  }

  return {
    data: data as T[],
    nextCursor,
    hasMore,
  };
}
