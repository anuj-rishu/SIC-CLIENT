import apiClient from '../lib/api-client';

export const adminService = {
  uploadAllowedEmails: (formData: FormData) => 
    apiClient.post('/admin-tasks/upload-emails', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  getAllAllowedEmails: () => apiClient.get('/admin-tasks/allowed-emails'),
  removeAllowedEmail: (id: string) => apiClient.delete(`/admin-tasks/allowed-emails/${id}`),
  removeAllAllowedEmails: () => apiClient.delete('/admin-tasks/allowed-emails'),
};
