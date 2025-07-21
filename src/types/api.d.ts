export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface UpdateHealthDataConsentDto {
  healthDataConsent: boolean;
}

export interface PaginationResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
