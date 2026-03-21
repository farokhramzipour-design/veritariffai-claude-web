import apiClient from './client';
import type {
  SanctionsScreenRequest,
  ClearanceRequest,
} from '@/types/api';

export const complianceApi = {
  sanctionsScreen: (data: SanctionsScreenRequest) =>
    apiClient.post('/api/v1/compliance/sanctions-screen', data),

  createClearance: (data: ClearanceRequest) =>
    apiClient.post('/api/v1/compliance/clearance', data),

  getClearance: (clearanceId: string) =>
    apiClient.get(`/api/v1/compliance/clearance/${clearanceId}`),
};
