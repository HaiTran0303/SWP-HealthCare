import { apiClient } from "./api";
import { API_ENDPOINTS } from "@/config/api";

export interface ConsultantProfile {
  id: string;
  userId: string;
  name: string;
  specialties: string[];
  qualification: string;
  experience: string;
  rating: number;
  avatarUrl: string;
  consultationFee: number;
  // ... các trường khác nếu cần
}

export const ConsultantService = {
  async getAll(params: Record<string, any> = {}) {
    const query = new URLSearchParams(params).toString();
    return apiClient.get<ConsultantProfile[]>(
      `${API_ENDPOINTS.CONSULTANTS.BASE}${query ? `?${query}` : ""}`
    );
  },
  async getById(id: string) {
    return apiClient.get<ConsultantProfile>(
      `${API_ENDPOINTS.CONSULTANTS.BASE}/${id}`
    );
  },
};
