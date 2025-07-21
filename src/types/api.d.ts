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

export interface CreateBlogDto {
  authorId: string;
  title: string;
  content: string;
  status: "draft" | "pending_review" | "needs_revision" | "rejected" | "approved" | "published" | "archived";
  featuredImage?: string;
  tags: string[];
  views?: number;
  seoTitle?: string;
  seoDescription?: string;
  relatedServicesIds?: string[];
  excerpt?: string;
  categoryId: string;
  autoPublish?: boolean;
}
