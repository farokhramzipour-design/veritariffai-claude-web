import apiClient from './client';

type CheckoutRequest = { plan: string; billing_period: string };

export const subscriptionsApi = {
  checkout: (request: CheckoutRequest) =>
    apiClient.post('/api/v1/subscriptions/checkout', request),

  portal: () =>
    apiClient.post('/api/v1/subscriptions/portal'),
  
  stripeWebhook: (payload: any) =>
    apiClient.post('/api/v1/subscriptions/webhooks/stripe', payload),
};
