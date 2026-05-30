import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

export function attachAuthInterceptors(getToken, onUnauthorized) {
  api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;
      if (status === 401) {
        onUnauthorized();
      }
      return Promise.reject(error);
    },
  );
}

export function apiMessage(error, fallback = 'Something went wrong') {
  return error.response?.data?.message || error.message || fallback;
}
