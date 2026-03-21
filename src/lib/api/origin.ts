import apiClient from './client';
import type {
  ROOCheckRequest,
  OriginDeclarationRequest,
} from '@/types/api';

export const originApi = {
  rooCheck: (data: ROOCheckRequest) =>
    apiClient.post('/api/v1/origin/roo-check', data),

  createDeclaration: (data: OriginDeclarationRequest) =>
    apiClient.post('/api/v1/origin/declaration', data),

  getDeclaration: (declarationId: string) =>
    apiClient.get(`/api/v1/origin/declaration/${declarationId}`),
};
