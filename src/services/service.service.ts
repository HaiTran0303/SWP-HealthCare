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
  // ... các trường khác nếu cần
}

export const ServiceService = {
  async getAll(params: Record<string, any> = {}) {
    const query = new URLSearchParams(params).toString();
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;
    const res = await fetch(
      `https://gender-healthcare.org/package-services${query ? `?${query}` : ""}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    return res.json();
  },
  async getById(id: string) {
    return apiClient.get<Service>(API_ENDPOINTS.SERVICES.BY_ID(id));
  },
};
