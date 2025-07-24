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
  meta: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
  };
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

export interface ReviewBlogDto {
  status: "approved" | "rejected" | "needs_revision";
  rejectionReason?: string;
  revisionNotes?: string;
}

export interface PublishBlogDto {
  publishNotes?: string;
}

export interface UpdateBlogDto {
  authorId?: string;
  title?: string;
  content?: string;
  status?: "draft" | "pending_review" | "needs_revision" | "rejected" | "approved" | "published" | "archived";
  featuredImage?: string;
  tags?: string[];
  views?: number;
  seoTitle?: string;
  seoDescription?: string;
  relatedServicesIds?: string[];
  excerpt?: string;
  categoryId?: string;
  autoPublish?: boolean;
}

export interface BlogQueryParams {
  title?: string;
  status?: "draft" | "pending_review" | "needs_revision" | "rejected" | "approved" | "published" | "archived";
  categoryId?: string;
  tags?: string[];
  sortBy?: "createdAt" | "updatedAt" | "views" | "title" | "publishedAt";
  sortOrder?: "ASC" | "DESC";
  page?: number;
  limit?: number;
}

export interface Appointment {
  id: string;
  userId: string;
  consultantId?: string;
  serviceId?: string;
  appointmentDate: string;
  appointmentLocation: "online" | "office";
  notes?: string;
  status: "pending" | "confirmed" | "checked_in" | "in_progress" | "completed" | "cancelled" | "rescheduled" | "no_show";
  meetingLink?: string; // Add this line
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  user?: any; // Assuming User interface is defined elsewhere or can be 'any' for now
  consultant?: any; // Assuming Consultant interface is defined elsewhere or can be 'any' for now
  service?: any; // Assuming Service interface is defined elsewhere or can be 'any' for now
}

export interface Image {
  id: string;
  name: string;
  originalName: string;
  size: number;
  width?: number;
  height?: number;
  format?: string;
  altText?: string;
  entityType: string;
  entityId: string;
  isPublic: boolean;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadImageResponse {
  id: string;
  url: string;
  entityType: string;
  entityId: string;
  altText?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceImageDto {
  serviceId: string;
  imageId: string;
}
