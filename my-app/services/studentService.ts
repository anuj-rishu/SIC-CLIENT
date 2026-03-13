import apiClient from '../lib/api-client';

export const studentService = {
  register: (data: any) => apiClient.post('/student/register', data),
  login: (data: any) => apiClient.post('/student/login', data),
  getProfile: () => apiClient.get('/student/profile'),
};
