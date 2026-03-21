import apiClient from './client';
import type { AutofillRequest, AutofillResponse } from '@/types/api';

export const autofillApi = {
  autofill: (data: AutofillRequest) =>
    apiClient.post<AutofillResponse>('/api/v1/autofill', data),
};
