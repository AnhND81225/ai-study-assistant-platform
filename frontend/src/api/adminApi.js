import { api } from './client';

export const adminApi = {
  users: () => api.get('/admin/users?sort=createdAt,desc').then((res) => res.data.data),
  aiUsage: () => api.get('/admin/ai-usage-logs?sort=createdAt,desc').then((res) => res.data.data),
};
