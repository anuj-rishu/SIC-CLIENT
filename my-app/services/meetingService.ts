import apiClient from '../lib/api-client';

export const meetingService = {
  scheduleMeeting: (meetingData: any) => apiClient.post('/meetings', meetingData),
  getMeetings: () => apiClient.get('/meetings'),
  completeMeeting: (id: string) => apiClient.put(`/meetings/${id}/complete`),
  updateMeeting: (id: string, meetingData: any) => apiClient.put(`/meetings/${id}`, meetingData),
  deleteMeeting: (id: string) => apiClient.delete(`/meetings/${id}`)
};
