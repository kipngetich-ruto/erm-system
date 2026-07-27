import api from './client';

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  verify2FA: (email: string, totp: string) =>
    api.post('/auth/verify-2fa', { email, totp }),
  logout: () => api.post('/auth/logout'),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
};

export const patientApi = {
  getAll: () => api.get('/patients'),
  create: (data: any) => api.post('/patients', data),
  getById: (id: string) => api.get(`/patients/${id}`),
};

export const recordApi = {
  create: (data: any) => api.post('/records', data),
  getByPatient: (patientId: string) => api.get(`/records/patient/${patientId}`),
};