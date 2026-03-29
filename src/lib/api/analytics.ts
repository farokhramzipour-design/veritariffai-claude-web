import apiClient from './client';

export interface AnalyticsPipelineRun {
  status: string | null;
  records_processed: number | null;
  started_at: string | null;
  completed_at: string | null;
}

export interface AnalyticsKpisV2Response {
  data: {
    tariff: {
      hs_codes: number;
      measures: number;
      vat_rates: number;
    };
    pipeline: {
      latest_runs: Record<string, AnalyticsPipelineRun>;
    };
    dashboard: {
      total_calculated: {
        amount: string;
        currency: string;
        display?: string | null;
        calcs: number;
      };
      avg_confidence: {
        pct: number | null;
        calcs: number;
      };
      this_month: {
        calcs: number;
        delta_vs_last_month: number;
      };
    };
  };
  meta: {
    request_id: string;
    timestamp: string;
  };
}

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
  getKpis: () => apiClient.get('/api/v1/analytics/kpis') as Promise<AnalyticsKpisV2Response | AnalyticsKpisResponse>,
};
