import apiClient from '../lib/api-client';

export const memberService = {
  getAllMembers: () => apiClient.get('/admin/active'),
  getInactiveMembers: () => apiClient.get('/admin/inactive'),
  getActiveAdmins: () => apiClient.get('/admin/active-admins'),
};
