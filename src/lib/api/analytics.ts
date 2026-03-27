import apiClient from './client';

export interface AnalyticsKpisResponse {
  data: {
    total_calculated: {
      amount: string;
      currency: string;
      calc_count: number;
    };
    avg_confidence_pct: number;
    this_month: {
      count: number;
      delta_vs_last_month: number;
    };
  };
  meta: {
    request_id: string;
    timestamp: string;
  };
}

export const analyticsApi = {
  getKpis: () => apiClient.get('/api/v1/analytics/kpis') as Promise<AnalyticsKpisResponse>,
};
