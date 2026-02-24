import apiClient from './client';

type GoogleAuthRequest = { id_token: string };

export const authApi = {
  loginGoogle: () => 
    apiClient.get('/api/v1/auth/google/login'),

  callbackGoogle: (code: string, error?: string) =>
    apiClient.get('/api/v1/auth/google/callback', { params: { code, error } }),

  authGoogle: (request: GoogleAuthRequest) =>
    apiClient.post('/api/v1/auth/google', request),

  refresh: () =>
    apiClient.post('/api/v1/auth/refresh'),

  logout: () =>
    apiClient.delete('/api/v1/auth/session'),
};
