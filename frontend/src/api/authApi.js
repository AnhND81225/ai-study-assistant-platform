import { api } from './client';

export const authApi = {
  register: (payload) => api.post('/auth/register', payload).then((res) => res.data.data),
  login: (payload) => api.post('/auth/login', payload).then((res) => res.data.data),
  googleLogin: (credential) => api.post('/auth/google', { credential }).then((res) => res.data.data),
  verifyEmail: (token) => api.post('/auth/verify-email', null, { params: { token } }).then((res) => res.data),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }).then((res) => res.data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }).then((res) => res.data),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }).then((res) => res.data),
  me: () => api.get('/users/me').then((res) => res.data.data),
};
