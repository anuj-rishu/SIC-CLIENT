import apiClient from '../lib/api-client';

export const interviewService = {
  // Admin routes
  createSchedule: (data: any) => apiClient.post('/interview/schedule', data),
  getAllBookings: () => apiClient.get('/interview/admin/bookings'),
  evaluateBooking: (bookingId: string, data: any) => 
    apiClient.put(`/interview/admin/bookings/${bookingId}/evaluate`, data),
  adminDeleteBooking: (bookingId: string) => 
    apiClient.delete(`/interview/admin/bookings/${bookingId}`),
  getAllSchedules: () => apiClient.get('/interview/admin/schedules'),
  updateSchedule: (scheduleId: string, data: any) => 
    apiClient.put(`/interview/admin/schedules/${scheduleId}`, data),
  deleteSchedule: (scheduleId: string) => 
    apiClient.delete(`/interview/admin/schedules/${scheduleId}`),


  // Student/General routes
  getAvailableSlots: () => apiClient.get('/interview/slots'),
  bookSlot: (data: any) => apiClient.post('/interview/book', data),
  getMyBookings: () => apiClient.get('/interview/my-bookings'),
  rescheduleBooking: (data: any) => apiClient.put('/interview/book/reschedule', data),
  cancelBooking: (bookingId: string) => apiClient.delete(`/interview/book/${bookingId}`),
};
