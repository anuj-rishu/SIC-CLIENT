import axios from 'axios';
import { getCookie, deleteCookie } from 'cookies-next';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const inflightRequests = new Map<string, Promise<any>>();

const originalRequest = apiClient.request.bind(apiClient);

apiClient.request = function (config: any) {
  const method = config.method?.toUpperCase() || 'GET';
  const requestKey = `${method}:${config.url}`;

  if (method === 'GET') {
    if (inflightRequests.has(requestKey)) {
      return inflightRequests.get(requestKey)!;
    }

    const promise = originalRequest(config).finally(() => {
      inflightRequests.delete(requestKey);
    });

    inflightRequests.set(requestKey, promise);
    return promise;
  }

  return originalRequest(config);
};

apiClient.interceptors.request.use((config) => {
  const token = getCookie('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      deleteCookie('token');
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
