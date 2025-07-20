import { apiClient } from "@/services/api";
import { API_ENDPOINTS } from "@/config/api";

export interface Consultant {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  specialties: string[];
  qualification: string;
  experience: string;
  bio: string;
  consultationFee: number;
  consultationFeeType: "hourly" | "per_session" | "per_service";
  sessionDurationMinutes: number;
  isAvailable: boolean;
  profileStatus: "active" | "on_leave" | "training" | "inactive" | "pending_approval" | "rejected";
  languages: string[];
  consultationTypes: ("online" | "office")[];
  createdAt: string;
  updatedAt: string;
}

export interface GetConsultantsParams {
  page?: number;
  limit?: number;
  search?: string; // Search by consultant name
  specialties?: string; // Comma-separated list
  minConsultationFee?: number;
  maxConsultationFee?: number;
  consultationTypes?: "online" | "office";
  status?: "active" | "on_leave" | "training" | "inactive" | "pending_approval" | "rejected";
  isAvailable?: boolean;
  minRating?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface GetConsultantsResponse {
  data: Consultant[];
  total: number;
  page: number;
  limit: number;
}

export const ConsultantService = {
  async getAll(params?: GetConsultantsParams): Promise<GetConsultantsResponse> {
    try {
      const query = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query.append(key, String(value));
          }
        });
      }
      const queryString = query.toString();
      const url = `${API_ENDPOINTS.CONSULTANTS.BASE}${queryString ? `?${queryString}` : ""}`;
      
      const response = await apiClient.get<GetConsultantsResponse>(url);
      return response;
    } catch (error) {
      console.error("Error fetching consultants:", error);
      throw error;
    }
  },

  // You can add other consultant-related API calls here (e.g., approve, reject, update)
};
