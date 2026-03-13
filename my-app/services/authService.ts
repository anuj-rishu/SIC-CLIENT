import apiClient from '../lib/api-client';

export const authService = {
  login: (credentials: any) => apiClient.post('/auth/login', credentials),
  forgotPassword: (email: string) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (data: any) => apiClient.post('/auth/reset-password', data),
  changePassword: (data: any) => apiClient.put('/auth/change-password', data),
  getProfile: () => apiClient.get('/auth/profile'),
  updateProfile: (formData: FormData) => 
    apiClient.put('/auth/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  addMember: (data: any) => apiClient.post('/auth/add-member', data),
  deleteMember: (id: string) => apiClient.delete(`/auth/member/${id}`),
  toggleMemberStatus: (id: string) => apiClient.put(`/auth/member-status/${id}`),
  changeMemberRole: (id: string, role: string) => apiClient.put(`/auth/member-role/${id}`, { role }),
  requestEmailChange: (newEmail: string) => apiClient.post('/auth/request-email-change', { newEmail }),
  verifyEmailChange: (data: any) => apiClient.put('/auth/verify-email-change', data),
  getTeamMembers: () => apiClient.get('/auth/team-members'),
  logout: () => apiClient.post('/auth/logout'),
  generatePasskeyRegisterOptions: () => apiClient.get('/auth/passkey/register/options'),
  verifyPasskeyRegister: (data: any) => apiClient.post('/auth/passkey/register/verify', data),
  generatePasskeyLoginOptions: (email?: string) => apiClient.post('/auth/passkey/login/options', { email }),
  verifyPasskeyLogin: (response: any, email?: string, challengeId?: string) => apiClient.post('/auth/passkey/login/verify', { email, response, challengeId }),
  deletePasskey: (credentialID: string) => apiClient.delete(`/auth/passkey/${credentialID}`),
};
