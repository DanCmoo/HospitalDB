import { apiClient } from './client';
import { Usuario, CreateUsuarioDto, UpdateUsuarioDto, LoginDto } from '../types/usuario';

export const authApi = {
  login: async (data: LoginDto): Promise<Usuario> => {
    return apiClient.post<Usuario>('/auth/login', data);
  },

  register: async (data: CreateUsuarioDto): Promise<Usuario> => {
    return apiClient.post<Usuario>('/auth/register', data);
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getProfile: async (): Promise<Usuario> => {
    return apiClient.get<Usuario>('/auth/profile');
  },

  checkSession: async (): Promise<{ authenticated: boolean; user?: any }> => {
    return apiClient.get<{ authenticated: boolean; user?: any }>('/auth/session');
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await apiClient.put('/auth/change-password', { oldPassword, newPassword });
  },

  // Admin endpoints
  getAllUsers: async (rol?: string): Promise<Usuario[]> => {
    const url = rol ? `/auth/usuarios?rol=${rol}` : '/auth/usuarios';
    return apiClient.get<Usuario[]>(url);
  },

  getUserById: async (id: number): Promise<Usuario> => {
    return apiClient.get<Usuario>(`/auth/usuarios/${id}`);
  },

  updateUser: async (id: number, data: UpdateUsuarioDto): Promise<Usuario> => {
    return apiClient.put<Usuario>(`/auth/usuarios/${id}`, data);
  },

  deleteUser: async (id: number): Promise<void> => {
    await apiClient.delete(`/auth/usuarios/${id}`);
  },
};
