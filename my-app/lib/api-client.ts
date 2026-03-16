import axios from 'axios';
import { getCookie, deleteCookie } from 'cookies-next';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const pendingRequests = new Set<string>();

apiClient.interceptors.request.use((config) => {
  const token = getCookie('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const requestKey = `${config.method?.toUpperCase()}:${config.url}`;
  if (pendingRequests.has(requestKey)) {
    const error = new Error('Duplicate request blocked');
    (error as any).isDuplicate = true;
    return Promise.reject(error);
  }
  
  pendingRequests.add(requestKey);
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    const config = response.config;
    const requestKey = `${config.method?.toUpperCase()}:${config.url}`;
    pendingRequests.delete(requestKey);
    return response;
  },
  (error) => {
    if (error.config) {
      const config = error.config;
      const requestKey = `${config.method?.toUpperCase()}:${config.url}`;
      pendingRequests.delete(requestKey);
    }

    if (error.response?.status === 401) {
      deleteCookie('token');
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }

    if (error.response?.status === 429) {
      // Just pass through the rate limit error so DataContext can show the message
      return Promise.reject(error);
    }
    
    if (error.isDuplicate) {
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
