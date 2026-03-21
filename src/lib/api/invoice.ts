import apiClient from './client';
import type { InvoiceUploadResponse } from '@/types/api';

export const invoiceApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<InvoiceUploadResponse>('/api/v1/invoice/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
