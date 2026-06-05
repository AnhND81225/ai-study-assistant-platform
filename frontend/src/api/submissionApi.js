import { api } from './client';

export const submissionApi = {
  create: ({ subjectId, note, image }) => {
    const formData = new FormData();
    formData.append('subjectId', subjectId);
    if (note) formData.append('note', note);
    formData.append('image', image);
    return api.post('/submissions', formData).then((res) => res.data.data);
  },
  mine: (params = {}) => api.get('/submissions/me', {
    params: {
      sort: 'createdAt,desc',
      ...params,
    },
  }).then((res) => res.data.data),
  detail: (id) => api.get(`/submissions/${id}`).then((res) => res.data.data),
  update: (id, payload) => api.patch(`/submissions/${id}`, payload).then((res) => res.data.data),
  explain: (id) => api.post(`/submissions/${id}/explain`).then((res) => res.data.data),
  grade: (id, userAnswer) => api.post(`/submissions/${id}/grade`, { userAnswer }).then((res) => res.data.data),
  gradeImage: (id, image) => {
    const formData = new FormData();
    formData.append('image', image);
    return api.post(`/submissions/${id}/grade-image`, formData).then((res) => res.data.data);
  },
  gradeNewImage: ({ subjectId, note, image }) => {
    const formData = new FormData();
    formData.append('subjectId', subjectId);
    if (note) formData.append('note', note);
    formData.append('image', image);
    return api.post('/gradings/image', formData).then((res) => res.data.data);
  },
  remove: (id) => api.delete(`/submissions/${id}`).then((res) => res.data.data),
  adminList: () => api.get('/admin/submissions?sort=createdAt,desc').then((res) => res.data.data),
  adminDetail: (id) => api.get(`/admin/submissions/${id}`).then((res) => res.data.data),
};
