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
      if (status === 401 && getToken()) {
        onUnauthorized();
      }
      return Promise.reject(error);
    },
  );
}

export function apiMessage(error, fallback = 'Something went wrong') {
  const status = error.response?.status;
  const code = error.response?.data?.errorCode;

  if (!error.response) {
    return 'We could not reach the server. Check your connection and try again.';
  }
  if (status === 401 || code === 'AUTHENTICATION_FAILED') {
    return 'Your session has expired. Please sign in again.';
  }
  if (status === 403) {
    return 'You do not have permission to perform this action.';
  }
  if (status === 404) {
    return 'This item could not be found. It may have been removed.';
  }
  if (status === 429 || code === 'AI_USAGE_LIMIT_EXCEEDED') {
    return error.response?.data?.message || 'You have reached today’s AI request limit. Try again after it resets.';
  }
  if (code === 'AI_TIMEOUT') {
    return 'The AI took too long to respond. Your upload is safe, so you can try again.';
  }
  if (code?.startsWith('AI_')) {
    return error.response?.data?.message || 'The AI service is temporarily unavailable. Please try again.';
  }
  if (status >= 500) {
    return 'The server ran into a problem. Please try again in a moment.';
  }
  return error.response?.data?.message || fallback;
}

export function isRetryableError(error) {
  const status = error.response?.status;
  return !error.response || status === 408 || status === 429 || status >= 500;
}
