import apiClient from '../lib/api-client';

export const selectionService = {
  importSelections: (formData: FormData) => apiClient.post('/selection/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  deleteSelections: (ids: string[]) => apiClient.delete('/selection/delete', { data: { ids } }),

  getSelections: (params?: any) => apiClient.get('/selection/all', { params }),
  getDistinctYears: () => apiClient.get('/selection/years'),
  getMyStatus: () => apiClient.get('/selection/my-status'),
};
