import { API_ENDPOINTS } from "../config/api";
import { CreateFeedbackDto, Feedback, FeedbackQueryParams, UpdateFeedbackDto } from "../types/feedback";
import { ApiResponse, PaginationResponse } from "../types/api";
import { apiClient } from "./api";

export const FeedbackService = {
  // Create a new feedback
  createFeedback: async (feedbackData: CreateFeedbackDto): Promise<Feedback> => {
    const response = await apiClient.post<Feedback>(API_ENDPOINTS.FEEDBACKS, feedbackData);
    return response;
  },

  // Get all feedbacks with pagination and filters
  getAllFeedbacks: async (
    params?: FeedbackQueryParams
  ): Promise<PaginationResponse<Feedback>> => {
    const response = await apiClient.get<PaginationResponse<Feedback>>(API_ENDPOINTS.FEEDBACKS, { params });
    return response;
  },

  // Get a single feedback by ID
  getFeedbackById: async (id: string): Promise<Feedback> => {
    const response = await apiClient.get<Feedback>(`${API_ENDPOINTS.FEEDBACKS}/${id}`);
    return response;
  },

  // Update a feedback by ID (Manager or Admin only)
  updateFeedback: async (
    id: string,
    feedbackData: UpdateFeedbackDto
  ): Promise<Feedback> => {
    const response = await apiClient.patch<Feedback>(
      `${API_ENDPOINTS.FEEDBACKS}/${id}`,
      feedbackData
    );
    return response;
  },

  // Soft delete a feedback by ID (Admin only)
  deleteFeedback: async (id: string): Promise<any> => {
    const response = await apiClient.delete<any>(`${API_ENDPOINTS.FEEDBACKS}/${id}`);
    return response;
  },
};
