import apiClient from '../lib/api-client';

export const roomieConfigService = {
  getConfig: (key: string) => apiClient.get(`/roomie-config/${key}`),
  requestPriceChangeOTP: (key: string, value: string) => apiClient.post(`/roomie-config/request-otp/${key}`, { value }),
  updateConfig: (key: string, value: string, otp?: string) => apiClient.post(`/roomie-config/${key}`, { value, otp }),
};
