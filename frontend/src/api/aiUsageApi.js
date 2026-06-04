import { api } from './client';

export const aiUsageApi = {
  mine: () => api.get('/ai-usage/me').then((res) => res.data.data),
};
