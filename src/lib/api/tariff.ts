import apiClient from './client';
import type { TariffHSLookupRequest, DutyRateParams } from '@/types/api';

export const tariffApi = {
  search: (q: string, jurisdiction = 'UK', limit = 10) =>
    apiClient.get('/api/v1/tariff/hs-codes/search', {
      params: { q, jurisdiction, limit },
    }),

  getCode: (code: string, jurisdiction = 'UK') =>
    apiClient.get(`/api/v1/tariff/hs-codes/${code}`, { params: { jurisdiction } }),

  hsLookup: (request: TariffHSLookupRequest) =>
    apiClient.post('/api/v1/tariff/hs-lookup', request),

  getDutyRate: (params: DutyRateParams) =>
    apiClient.get('/api/v1/duty-rate', { params }),
};
