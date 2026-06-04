import apiClient from '../lib/api-client';

export interface SentryIssueQuery {
  cursor?: string;
  search?: string;
  level?: string;
  status?: string;
  project?: string;
}

export interface AssignIssueData {
  assignedTo: string;
  priority?: string;
  deadline?: string;
  description?: string;
}

export const sentryService = {
  getIssues: (params?: SentryIssueQuery) =>
    apiClient.get('/sentry/issues', { params }),

  getIssueDetail: (id: string) =>
    apiClient.get(`/sentry/issues/${id}`),

  getIssueEvents: (id: string) =>
    apiClient.get(`/sentry/issues/${id}/events`),

  assignIssue: (id: string, data: AssignIssueData) =>
    apiClient.post(`/sentry/issues/${id}/assign`, data),

  unassignIssue: (id: string) =>
    apiClient.post(`/sentry/issues/${id}/unassign`),

  removeMember: (id: string, userId: string) =>
    apiClient.post(`/sentry/issues/${id}/remove-member`, { userId }),

  resolveIssue: (id: string) =>
    apiClient.put(`/sentry/issues/${id}/resolve`),

  getStats: (params?: { project?: string }) =>
    apiClient.get('/sentry/stats', { params }),

  getProjects: () =>
    apiClient.get('/sentry/projects'),
};
