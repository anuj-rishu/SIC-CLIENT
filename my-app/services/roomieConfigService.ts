import apiClient from '../lib/api-client';

export const roomieConfigService = {
  getConfig: (key: string) => apiClient.get(`/roomie-config/${key}`),
  updateConfig: (key: string, value: string) => apiClient.post(`/roomie-config/${key}`, { value }),
};
