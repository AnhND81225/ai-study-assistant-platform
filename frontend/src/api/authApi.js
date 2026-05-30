import { api } from './client';

export const authApi = {
  register: (payload) => api.post('/auth/register', payload).then((res) => res.data.data),
  login: (payload) => api.post('/auth/login', payload).then((res) => res.data.data),
  me: () => api.get('/users/me').then((res) => res.data.data),
};
