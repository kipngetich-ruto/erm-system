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

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  
  getActivities: () => api.get('/dashboard/activities'),
};

export const patientApi = {
  getAll: (search?: string) => api.get('/patients', { params: { search } }),

  getById: (id: string) => api.get(`/patients/${id}`),

  create: (data: any) => api.post('/patients', data),

  update: (id: string, data: any) => api.put(`/patients/${id}`, data),

  delete: (id: string) => api.delete(`/patients/${id}`),
};

export const appointmentApi = {
  getAll: (params?: { patientId?: string; doctorId?: string; status?: string; from?: string; to?: string }) =>
    api.get('/appointments', { params }),

  getById: (id: string) => api.get(`/appointments/${id}`),

  create: (data: any) => api.post('/appointments', data),

  update: (id: string, data: any) => api.put(`/appointments/${id}`, data),
  
  delete: (id: string) => api.delete(`/appointments/${id}`),
};

export const recordApi = {
  getAll: (params?: { patientId?: string; doctorId?: string; search?: string }) =>
    api.get('/medical-records', { params }),

  getById: (id: string) => api.get(`/medical-records/${id}`),

  create: (data: any) => api.post('/medical-records', data),

  update: (id: string, data: any) => api.put(`/medical-records/${id}`, data),

  delete: (id: string) => api.delete(`/medical-records/${id}`),
};

export const auditApi = {
  getLogs: (limit?: number, offset?: number) =>
    api.get('/audit', { params: { limit, offset } }),
};

export const prescriptionApi = {
  getAll: (params?: { patientId?: string; doctorId?: string; status?: string }) =>
    api.get('/prescriptions', { params }),

  getById: (id: string) => api.get(`/prescriptions/${id}`),

  create: (data: any) => api.post('/prescriptions', data),

  update: (id: string, data: any) => api.put(`/prescriptions/${id}`, data),
  
  delete: (id: string) => api.delete(`/prescriptions/${id}`),
};

export const labResultsApi = {
  getAll: (params?: { patientId?: string; doctorId?: string; status?: string }) =>
    api.get('/lab-results', { params }),

  getById: (id: string) => api.get(`/lab-results/${id}`),

  create: (data: any) => api.post('/lab-results', data),

  update: (id: string, data: any) => api.put(`/lab-results/${id}`, data),
  
  delete: (id: string) => api.delete(`/lab-results/${id}`),
};