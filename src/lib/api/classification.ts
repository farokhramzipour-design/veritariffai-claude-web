import apiClient from './client';
import type {
  SteelClassifyRequest,
  PreClassificationCheckRequest,
} from '@/types/api';

export const classificationApi = {
  steelClassify: (data: SteelClassifyRequest) =>
    apiClient.post('/api/v1/classification/steel', data),

  preCheck: (data: PreClassificationCheckRequest) =>
    apiClient.post('/api/v1/classification/pre-check', data),
};
