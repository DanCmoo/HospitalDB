import { apiClient } from './client';
import { Usuario, CreateUsuarioDto, UpdateUsuarioDto, LoginDto } from '../types/usuario';

export const authApi = {
  login: async (data: LoginDto): Promise<Usuario> => {
    const response = await apiClient.post<Usuario>('/auth/login', data);
    return response.data;
  },

  register: async (data: CreateUsuarioDto): Promise<Usuario> => {
    const response = await apiClient.post<Usuario>('/auth/register', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getProfile: async (): Promise<Usuario> => {
    const response = await apiClient.get<Usuario>('/auth/profile');
    return response.data;
  },

  checkSession: async (): Promise<{ authenticated: boolean; user?: any }> => {
    const response = await apiClient.get<{ authenticated: boolean; user?: any }>('/auth/session');
    return response.data;
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await apiClient.put('/auth/change-password', { oldPassword, newPassword });
  },

  // Admin endpoints
  getAllUsers: async (rol?: string): Promise<Usuario[]> => {
    const url = rol ? `/auth/usuarios?rol=${rol}` : '/auth/usuarios';
    const response = await apiClient.get<Usuario[]>(url);
    return response.data;
  },

  getUserById: async (id: number): Promise<Usuario> => {
    const response = await apiClient.get<Usuario>(`/auth/usuarios/${id}`);
    return response.data;
  },

  updateUser: async (id: number, data: UpdateUsuarioDto): Promise<Usuario> => {
    const response = await apiClient.put<Usuario>(`/auth/usuarios/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await apiClient.delete(`/auth/usuarios/${id}`);
  },
};
