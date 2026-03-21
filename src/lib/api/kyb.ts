import apiClient from './client';
import type {
  UKCompanySnapshotRequest,
  CompanySnapshot,
  UKGuessEORIRequest,
  EORIValidationResult,
  EUVatCheckRequest,
  EUVatCheckResult,
  ProfileIntakeRequest,
  ProfileIntakeResponse,
} from '@/types/api';

export const kybApi = {
  ukCompanySnapshot: (data: UKCompanySnapshotRequest) =>
    apiClient.post<CompanySnapshot>('/api/v1/kyb/uk-company-snapshot', data),

  ukGuessEori: (data: UKGuessEORIRequest) =>
    apiClient.post<EORIValidationResult>('/api/v1/kyb/uk-guess-eori', data),

  validateEori: (eori: string) =>
    apiClient.get<EORIValidationResult>(`/api/v1/kyb/eori/${eori}`),

  euVatCheck: (data: EUVatCheckRequest) =>
    apiClient.post<EUVatCheckResult>('/api/v1/kyb/eu-vat-check', data),

  profileIntake: (data: ProfileIntakeRequest) =>
    apiClient.post<ProfileIntakeResponse>('/api/v1/kyb/profile-intake', data),
};
