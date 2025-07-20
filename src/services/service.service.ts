import { apiClient } from "@/services/api";
import { API_ENDPOINTS } from "@/config/api";

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  isActive: boolean;
  shortDescription?: string;
  prerequisites?: string;
  postInstructions?: string;
  featured: boolean;
  categoryId: string;
  requiresConsultant: boolean;
  location: "online" | "office";
  createdAt: string;
  updatedAt: string;
}

export interface GetServicesParams {
  page?: number;
  limit?: number;
  sortBy?: "name" | "price" | "duration" | "createdAt" | "updatedAt";
  sortOrder?: "ASC" | "DESC";
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  featured?: boolean;
  requiresConsultant?: boolean;
  location?: "online" | "office";
}

export interface GetServicesResponse {
  data: Service[];
  total: number;
  page: number;
  limit: number;
}

export const ServiceService = {
  async getAll(params?: GetServicesParams): Promise<GetServicesResponse> {
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
      const url = `${API_ENDPOINTS.SERVICES.BASE}${queryString ? `?${queryString}` : ""}`;
      
      const response = await apiClient.get<GetServicesResponse>(url);
      return response;
    } catch (error) {
      console.error("Error fetching services:", error);
      throw error;
    }
  },

  // You can add other service-related API calls here (e.g., create, update, delete)
};
