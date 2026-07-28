import api from './client';

export const authApi = {
  register: (email: string, password: string, role?: string) =>
    api.post('/auth/register', { email, password, role }),

  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  verify2FA: (email: string, totp: string) =>
    api.post('/auth/verify-2fa', { email, totp }),

  logout: () => api.post('/auth/logout'),

  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),

  generate2FA: (email: string) =>
    api.post('/auth/generate-2fa', { email }),
  
  enable2FA: (email: string, totp: string) =>
    api.post('/auth/enable-2fa', { email, totp }),

  disable2FA: (email: string, totp: string) =>
    api.post('/auth/disable-2fa', { email, totp }),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.patch('/auth/change-password', { currentPassword, newPassword }),
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
