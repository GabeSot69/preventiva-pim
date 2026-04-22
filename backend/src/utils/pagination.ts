export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class PaginationUtils {
  static createResult<T>(items: T[], total: number, page: number, limit: number): PaginatedResult<T> {
    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static getSkip(page: number, limit: number): number {
    return (page - 1) * limit;
  }
}
