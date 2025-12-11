import { apiClient } from './client';

export interface HealthCheckResponse {
  status: string;
  message: string;
  timestamp: string;
  uptime: string;
  environment: string;
  version: string;
}

export interface DatabaseHealthResponse {
  status: string;
  message: string;
  database: string;
  timestamp: string;
}

export const healthApi = {
  check: () => apiClient.get<HealthCheckResponse>('/health'),
  checkDatabase: () =>
    apiClient.get<DatabaseHealthResponse>('/health/database'),
};
