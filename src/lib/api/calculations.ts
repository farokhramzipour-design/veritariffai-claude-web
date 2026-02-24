import apiClient from './client';

// Assuming these types are defined elsewhere based on the full API spec
type CalculationRequest = any;
type CalculationResult = any;
type CalculationSummary = any;
type AuditTrail = any;
type Progress = any;
type CalculationFilters = any;

export const calculationsApi = {
  submitSync: (request: CalculationRequest) =>
    apiClient.post<CalculationResult>('/api/v1/calculations/sync', request),
    
  submitAsync: (request: CalculationRequest) =>
    apiClient.post<{ task_id: string; poll_url: string }>('/api/v1/calculations/async', request),
    
  getStatus: (taskId: string) =>
    apiClient.get<{ status: string; progress?: Progress }>(`/api/v1/calculations/${taskId}/status`),
    
  getResult: (requestId: string) =>
    apiClient.get<CalculationResult>(`/api/v1/calculations/${requestId}/result`),
    
  getAuditTrail: (requestId: string) =>
    apiClient.get<AuditTrail>(`/api/v1/calculations/${requestId}/audit`),
    
  list: (filters?: CalculationFilters) =>
    apiClient.get<CalculationSummary[]>('/api/v1/calculations', { params: filters }),

  delete: (requestId: string) =>
    apiClient.delete(`/api/v1/calculations/${requestId}`),
};
