import { apiClient } from "./api";
import { API_ENDPOINTS } from "@/config/api";

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  categoryId: string;
  requiresConsultant: boolean;
  imageUrl?: string; 
}

export const APIService = {
  async getAll(params: Record<string, any> = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = `${API_ENDPOINTS.SERVICES.BASE}${query ? `?${query}` : ""}`;
    return apiClient.get<Service[]>(endpoint);
  },
  async getById(id: string) {
    return apiClient.get<Service>(API_ENDPOINTS.SERVICES.BY_ID(id));
  },
};
