import { apiClient } from "./api";
import { API_ENDPOINTS } from "@/config/api";

export interface ConsultantProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  specialties: string[];
  qualification: string;
  experience: string;
  bio: string;
  consultationFee: number;
  isAvailable: boolean;
  rating: number;
  avatar: string;
  availability: ConsultantAvailability[];
}

export interface ConsultantAvailability {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location: string;
}

export const ConsultantService = {
  async getAll() {
    return apiClient.get<ConsultantProfile[]>(API_ENDPOINTS.CONSULTANTS.BASE);
  },
  async getAvailability(consultantId: string) {
    const endpoint = `${API_ENDPOINTS.CONSULTANTS.AVAILABILITY}?consultantId=${consultantId}`;
    return apiClient.get<ConsultantAvailability[]>(endpoint);
  },
};
