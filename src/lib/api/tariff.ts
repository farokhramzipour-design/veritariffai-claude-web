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

  lookupDutyRate: (params: DutyRateParams) =>
    apiClient.get('/api/v1/duty-rate/lookup', { params }),

  lookupTariff: (params: { hs_code: string; origin: string; destination: string; full_report?: boolean }) =>
    apiClient.get('/api/v1/tariff/lookup', { params }),

  importAnalysis: (body: {
    product_description: string;
    origin_country: string;
    destination_country: string;
    customs_value: number;
    currency: string;
    freight?: number;
    insurance?: number;
    quantity?: number;
    quantity_unit?: string;
    incoterms?: string;
    manufacturer_name?: string;
    goods_description_extended?: string;
  }) =>
    apiClient.post('/api/v1/import-analysis', body),
};
