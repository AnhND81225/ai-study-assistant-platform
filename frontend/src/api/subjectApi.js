import { api } from './client';

export const subjectApi = {
  list: () => api.get('/subjects').then((res) => res.data.data),
  create: (payload) => api.post('/admin/subjects', payload).then((res) => res.data.data),
  update: (id, payload) => api.put(`/admin/subjects/${id}`, payload).then((res) => res.data.data),
  remove: (id) => api.delete(`/admin/subjects/${id}`).then((res) => res.data.data),
};
