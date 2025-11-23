import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// INSTALAR: 
// npm install axios-mock-adapter
//npm install --save-dev @types/axios-mock-adapter
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9999';
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:9999';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (token && config.headers) {
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
