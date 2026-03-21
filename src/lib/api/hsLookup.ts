import apiClient from './client';
import type { HSLookupRequest, HSLookupResponse } from '@/types/api';

export const hsLookupApi = {
  lookup: (data: HSLookupRequest) =>
    apiClient.post<HSLookupResponse>('/api/v1/hs-lookup', data),
};
