import apiClient from './client';
import type {
  GoogleAuthRequest,
  MicrosoftAuthRequest,
  AcademicMockRequest,
} from '@/types/api';

export const authApi = {
  loginGoogle: () =>
    apiClient.get('/api/v1/auth/google/login'),

  callbackGoogle: (code: string, error?: string) =>
    apiClient.get('/api/v1/auth/google/callback', { params: { code, error } }),

  authGoogle: (request: GoogleAuthRequest) =>
    apiClient.post('/api/v1/auth/google', request),

  loginMicrosoft: () =>
    apiClient.get('/api/v1/auth/microsoft/login'),

  callbackMicrosoft: (code: string, error?: string) =>
    apiClient.get('/api/v1/auth/microsoft/callback', { params: { code, error } }),

  authMicrosoft: (request: MicrosoftAuthRequest) =>
    apiClient.post('/api/v1/auth/microsoft', request),

  authAcademicMock: (request: AcademicMockRequest) =>
    apiClient.post('/api/v1/auth/academic-mock', request),

  refresh: () =>
    apiClient.post('/api/v1/auth/refresh'),

  logout: () =>
    apiClient.delete('/api/v1/auth/session'),
};
