import { apiClient } from './client';

export const usuariosApi = {
  async getAll() {
    return apiClient.get('/auth/usuarios');
  },

  async getById(id: number) {
    return apiClient.get(`/auth/usuarios/${id}`);
  },

  async update(id: number, data: any) {
    return apiClient.put(`/auth/usuarios/${id}`, data);
  },

  async delete(id: number) {
    return apiClient.delete(`/auth/usuarios/${id}`);
  },

  async resetPassword(id: number, newPassword: string) {
    return apiClient.post(`/auth/usuarios/${id}/reset-password`, { newPassword });
  },

  async getActivityLogs(limit: number = 100) {
    return apiClient.get(`/auth/activity-logs?limit=${limit}`);
  },

  async getUserActivityLogs(id: number, limit: number = 50) {
    return apiClient.get(`/auth/usuarios/${id}/activity-logs?limit=${limit}`);
  },
};
