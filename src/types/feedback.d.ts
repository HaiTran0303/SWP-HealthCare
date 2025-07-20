export interface Feedback {
  id: string;
  userId: string;
  serviceId: string;
  appointmentId: string;
  consultantId: string;
  rating: number;
  comment?: string;
  isAnonymous?: boolean;
  staffResponse?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeedbackDto {
  userId: string;
  serviceId: string;
  appointmentId: string;
  consultantId: string;
  rating: number;
  comment?: string;
  isAnonymous?: boolean;
}

export interface UpdateFeedbackDto {
  rating?: number;
  comment?: string;
  isAnonymous?: boolean;
  staffResponse?: string;
}

export interface FeedbackQueryParams {
  page?: number;
  limit?: number;
  sortBy?: "rating" | "createdAt" | "updatedAt";
  sortOrder?: "ASC" | "DESC";
  userId?: string;
  serviceId?: string;
  appointmentId?: string;
  consultantId?: string;
  minRating?: number;
  maxRating?: number;
  isAnonymous?: boolean;
  searchComment?: string;
}
