import apiClient from './client';
import type { CheckoutRequest } from '@/types/api';

export const subscriptionsApi = {
  checkout: (request: CheckoutRequest) =>
    apiClient.post('/api/v1/subscriptions/checkout', request),

  portal: () =>
    apiClient.post('/api/v1/subscriptions/portal'),

  stripeWebhook: (payload: Record<string, unknown>) =>
    apiClient.post('/api/v1/subscriptions/webhooks/stripe', payload),
};
