import apiClient from '../lib/api-client';

export const momService = {
  createMoM: (data: any) => apiClient.post('/mom', data),
  getMoMs: (params?: any) => apiClient.get('/mom', { params }),
  getMoMById: (id: string) => apiClient.get(`/mom/${id}`),
  updateMoM: (id: string, data: any) => apiClient.put(`/mom/${id}`, data),
  deleteMoM: (id: string) => apiClient.delete(`/mom/${id}`),
};
