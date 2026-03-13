import apiClient from '../lib/api-client';

export const taskService = {
  assignTask: (data: any) => apiClient.post('/task/assign', data),
  getMyTasks: (page: number = 1, status?: string, priority?: string, search?: string) => {
    let url = `/task/my-tasks?page=${page}`;
    if (status && status !== 'All') url += `&status=${status}`;
    if (priority && priority !== 'All') url += `&priority=${priority}`;
    if (search) url += `&search=${search}`;
    return apiClient.get(url);
  },
  getTeamTasks: (status?: string, page: number = 1, priority?: string, search?: string) => {
    let url = `/task/team-tasks?page=${page}`;
    if (status && status !== 'All') url += `&status=${status}`;
    if (priority && priority !== 'All') url += `&priority=${priority}`;
    if (search) url += `&search=${search}`;
    return apiClient.get(url);
  },
  markTaskDone: (taskId: string) => apiClient.put(`/task/${taskId}/mark-done`),
  approveTask: (taskId: string) => apiClient.put(`/task/${taskId}/approve`),
  rejectTask: (taskId: string) => apiClient.put(`/task/${taskId}/reject`),
  updateTask: (taskId: string, data: any) => apiClient.put(`/task/${taskId}`, data),
  deleteTask: (taskId: string) => apiClient.delete(`/task/${taskId}`),
  getAllTasksForAdmin: (team?: string, page: number = 1, status?: string, search?: string, priority?: string) => {
    let url = `/task/all?page=${page}`;
    if (team && team !== 'All') url += `&team=${team}`;
    if (status && status !== 'All') url += `&status=${status}`;
    if (priority && priority !== 'All') url += `&priority=${priority}`;
    if (search) url += `&search=${search}`;
    return apiClient.get(url);
  },
  getTaskStats: () => apiClient.get('/task/stats'),
};
