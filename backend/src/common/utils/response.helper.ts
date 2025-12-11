export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: string;
}

export const createSuccessResponse = <T>(
  data: T,
  message?: string,
): ApiResponse<T> => {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
};

export const createErrorResponse = (message: string): ApiResponse<null> => {
  return {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };
};
