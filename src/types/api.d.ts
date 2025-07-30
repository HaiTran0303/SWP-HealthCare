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
  paymentStatus: "pending" | "completed" | "failed" | "refunded" | "cancelled"; // Thêm trạng thái thanh toán
  chatRoomId?: string; // Thêm ID phòng chat
  meetingLink?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  user?: User; // Use User interface from user.service.ts
  consultant?: ConsultantProfile; // Use ConsultantProfile interface from consultant.service.ts
  service?: Service; // Use Service interface from service.service.ts
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

export interface CreateQuestionDto {
  title: string;
  content: string;
  appointmentId?: string;
  isAnonymous?: boolean;
}

export interface Question {
  id: string;
  title: string;
  content: string;
  userId: string;
  appointmentId?: string;
  status: "pending" | "answered" | "closed"; // Thêm trạng thái cho câu hỏi chat
  isAnonymous?: boolean; // Thêm thuộc tính ẩn danh
  unreadCount?: number; // Add unreadCount property
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  htmlDescription: string;
  price: number;
  duration: number;
  requiresConsultant: boolean;
  location: "online" | "office";
  prerequisites: string;
  postInstructions: string;
  createdAt: string;
  updatedAt: string;
  images?: Image[];
}

export type TestServiceType =
  | "sti_test"
  | "blood_test"
  | "urine_test"
  | "imaging"
  | "biopsy"
  | "genetic_test"
  | "hormone_test"
  | "allergy_test"
  | "cardiac_test"
  | "other";

export type TestResultUnit =
  | "mg/dL"
  | "g/L"
  | "mmol/L"
  | "IU/mL"
  | "ng/mL"
  | "pg/mL"
  | "cells/μL"
  | "million/μL"
  | "thousand/μL"
  | "%"
  | "ratio"
  | "positive"
  | "negative"
  | "reactive"
  | "non_reactive"
  | "none";

export type TestResultStatus = "normal" | "abnormal" | "borderline" | "critical";
export type TestResultOverallStatus = "normal" | "abnormal" | "inconclusive" | "critical";
export type TestResultAbnormalityLevel =
  | "normal"
  | "slightly_abnormal"
  | "moderately_abnormal"
  | "severely_abnormal"
  | "critical";

export interface SampleInfo {
  type: string;
  condition: string;
  volume?: string;
  collectionMethod?: string;
}

export interface TestResultItem {
  parameterName: string;
  displayName: string;
  category?: string;
  value: string | number;
  unit: TestResultUnit;
  referenceRange?: {
    normalValues?: (string | number)[];
    min?: number;
    max?: number;
    description?: string;
  };
  status: TestResultStatus;
  abnormalityLevel?: TestResultAbnormalityLevel;
  notes?: string;
  clinicalSignificance?: string;
  methodUsed?: string;
  equipmentUsed?: string;
  labTechnician?: string;
}

export interface LaboratoryInfo {
  name: string;
  address?: string;
  accreditation?: string;
  contactInfo?: string;
}

export interface QualityControl {
  passed: boolean;
  issues?: string[];
  reviewer?: string;
}

export interface TestResultData {
  serviceType: TestServiceType;
  testName: string;
  testCode?: string;
  sampleCollectedAt?: string;
  analyzedAt?: string;
  reportedAt?: string;
  sampleInfo?: SampleInfo;
  results: TestResultItem[];
  overallStatus: TestResultOverallStatus;
  summary?: string;
  clinicalInterpretation?: string;
  recommendations?: string[];
  laboratoryInfo?: LaboratoryInfo;
  qualityControl?: QualityControl;
}

export interface TestResultResponseDto {
  id: string;
  resultData: TestResultData;
  resultSummary?: string;
  isAbnormal: boolean;
  recommendation?: string;
  notificationSent: boolean;
  followUpRequired: boolean;
  followUpNotes?: string;
  createdAt: string;
  updatedAt: string;
  appointment?: Appointment;
  service?: Service;
  user?: User;
  documents?: string[]; // Assuming this is an array of document IDs or URLs
  notificationInfo?: any; // Define a more specific type if needed
}
