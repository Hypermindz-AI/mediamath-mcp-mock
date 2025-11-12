/**
 * Cursor-Based Pagination Utilities
 * Implements opaque cursor pagination for MCP responses
 */

export interface CursorData {
  offset: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface PaginationMeta {
  total: number;
  count: number;
  pageLimit: number;
  hasMore: boolean;
  nextCursor?: string;
  prevCursor?: string;
}

/**
 * Encode pagination state into a base64 cursor
 */
export function encodeCursor(data: CursorData): string {
  const json = JSON.stringify(data);
  return Buffer.from(json).toString('base64');
}

/**
 * Decode a base64 cursor into pagination state
 */
export function decodeCursor(cursor: string): CursorData {
  try {
    const json = Buffer.from(cursor, 'base64').toString('utf-8');
    const data = JSON.parse(json);

    // Validate structure
    if (
      typeof data.offset !== 'number' ||
      typeof data.sortBy !== 'string' ||
      (data.sortOrder !== 'asc' && data.sortOrder !== 'desc')
    ) {
      throw new Error('Invalid cursor structure');
    }

    return data;
  } catch (error) {
    throw new Error(`Invalid cursor: ${error instanceof Error ? error.message : 'unknown error'}`);
  }
}

/**
 * Paginate items and generate metadata
 */
export function paginate<T>(
  items: T[],
  options: {
    pageLimit?: number;
    cursor?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}
): {
  items: T[];
  meta: PaginationMeta;
} {
  const pageLimit = Math.min(options.pageLimit || 25, 25); // Max 25 items
  const sortBy = options.sortBy || 'id';
  const sortOrder = options.sortOrder || 'asc';

  // Decode cursor to get offset
  let offset = 0;
  if (options.cursor) {
    try {
      const cursorData = decodeCursor(options.cursor);
      offset = cursorData.offset;

      // Verify cursor matches current sort parameters
      if (cursorData.sortBy !== sortBy || cursorData.sortOrder !== sortOrder) {
        throw new Error('Cursor sort parameters do not match request');
      }
    } catch (error) {
      // Invalid cursor - start from beginning
      offset = 0;
    }
  }

  // Slice items for current page
  const paginatedItems = items.slice(offset, offset + pageLimit);
  const hasMore = offset + pageLimit < items.length;

  // Generate next cursor
  let nextCursor: string | undefined;
  if (hasMore) {
    nextCursor = encodeCursor({
      offset: offset + pageLimit,
      sortBy,
      sortOrder,
    });
  }

  // Generate previous cursor
  let prevCursor: string | undefined;
  if (offset > 0) {
    prevCursor = encodeCursor({
      offset: Math.max(0, offset - pageLimit),
      sortBy,
      sortOrder,
    });
  }

  return {
    items: paginatedItems,
    meta: {
      total: items.length,
      count: paginatedItems.length,
      pageLimit,
      hasMore,
      nextCursor,
      prevCursor,
    },
  };
}

/**
 * Create pagination metadata for already-paginated results
 * (when the data store has already sliced the data)
 */
export function createPaginationMeta(
  total: number,
  offset: number,
  limit: number,
  sortBy: string = 'id',
  sortOrder: 'asc' | 'desc' = 'asc'
): PaginationMeta {
  const hasMore = offset + limit < total;
  const count = Math.min(limit, total - offset);

  let nextCursor: string | undefined;
  if (hasMore) {
    nextCursor = encodeCursor({
      offset: offset + limit,
      sortBy,
      sortOrder,
    });
  }

  let prevCursor: string | undefined;
  if (offset > 0) {
    prevCursor = encodeCursor({
      offset: Math.max(0, offset - limit),
      sortBy,
      sortOrder,
    });
  }

  return {
    total,
    count,
    pageLimit: limit,
    hasMore,
    nextCursor,
    prevCursor,
  };
}

/**
 * Extract pagination parameters from tool arguments
 */
export function extractPaginationParams(args: {
  pageLimit?: number;
  cursor?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): {
  offset: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
} {
  const limit = Math.min(args.pageLimit || 25, 25);
  const sortBy = args.sortBy || 'id';
  const sortOrder = args.sortOrder || 'asc';

  let offset = 0;
  if (args.cursor) {
    try {
      const cursorData = decodeCursor(args.cursor);
      offset = cursorData.offset;
    } catch {
      // Invalid cursor - start from beginning
      offset = 0;
    }
  }

  return { offset, limit, sortBy, sortOrder };
}
