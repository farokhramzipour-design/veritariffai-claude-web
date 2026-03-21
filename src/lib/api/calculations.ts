import apiClient from './client';
import type {
  CalculationRequest,
  CalculationListParams,
  ProfileCreate,
  ProfileUpdate,
  ProfileListParams,
} from '@/types/api';

export const calculationsApi = {
  // ── Core calculations ───────────────────────────────────────────────────────

  submitSync: (request: CalculationRequest) =>
    apiClient.post('/api/v1/calculations/sync', request),

  submitAsync: (request: CalculationRequest) =>
    apiClient.post<{ task_id: string; poll_url: string }>('/api/v1/calculations/async', request),

  getStatus: (taskId: string) =>
    apiClient.get(`/api/v1/calculations/${taskId}/status`),

  getResult: (requestId: string) =>
    apiClient.get(`/api/v1/calculations/${requestId}/result`),

  getAuditTrail: (requestId: string) =>
    apiClient.get(`/api/v1/calculations/${requestId}/audit`),

  list: (params?: CalculationListParams) =>
    apiClient.get('/api/v1/calculations', { params }),

  delete: (requestId: string) =>
    apiClient.delete(`/api/v1/calculations/${requestId}`),

  // ── Calculation profiles ────────────────────────────────────────────────────

  createProfile: (data: ProfileCreate) =>
    apiClient.post('/api/v1/calculations/profiles', data),

  listProfiles: (params?: ProfileListParams) =>
    apiClient.get('/api/v1/calculations/profiles', { params }),

  getProfile: (profileId: string) =>
    apiClient.get(`/api/v1/calculations/profiles/${profileId}`),

  updateProfile: (profileId: string, data: ProfileUpdate) =>
    apiClient.patch(`/api/v1/calculations/profiles/${profileId}`, data),

  deleteProfile: (profileId: string) =>
    apiClient.delete(`/api/v1/calculations/profiles/${profileId}`),
};
