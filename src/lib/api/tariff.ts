import apiClient from './client';

type HSCodeSearchResult = any;
type HSCodeDetail = any;

export const tariffApi = {
  search: (q: string, jurisdiction = 'UK', limit = 10) =>
    apiClient.get<HSCodeSearchResult[]>('/api/v1/tariff/hs-codes/search', {
      params: { q, jurisdiction, limit }
    }),
    
  getCode: (code: string, jurisdiction = 'UK') =>
    apiClient.get<HSCodeDetail>(`/api/v1/tariff/hs-codes/${code}`, { params: { jurisdiction } }),
};
