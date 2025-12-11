export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
