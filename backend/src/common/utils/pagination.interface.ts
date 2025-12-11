export interface PaginationQueryDto {
  page?: number;
  limit?: number;
  sort?: string;
}

export interface PaginationResponseDto<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
