import { apiClient } from "./api"; // Changed to apiClient
import { API_ENDPOINTS } from "@/config/api";
import { UploadImageResponse, CreateServiceImageDto, Image } from "@/types/api";

export interface Service {
  id: string;
  name: string;
  description: string;
  htmlDescription?: string;
  price: number | null;
  duration: number;
  categoryId: string;
  requiresConsultant: boolean;
  images?: Image[]; // Changed from imageUrl to images array
  shortDescription?: string;
  prerequisites?: string;
  postInstructions?: string;
  featured?: boolean;
  location?: "online" | "office";
  type?: string;
  isActive?: boolean;
  createdAt: string; // Add createdAt
  updatedAt: string; // Add updatedAt
}

export interface GetServicesQuery {
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

export interface CreateServiceDto {
  name: string;
  description: string;
  price: number;
  duration: number;
  categoryId: string;
  isActive?: boolean;
  shortDescription?: string;
  prerequisites?: string;
  postInstructions?: string;
  featured?: boolean;
  requiresConsultant?: boolean;
  location?: "online" | "office";
}

export interface UpdateServiceDto {
  name?: string;
  description?: string;
  price?: number;
  duration?: number;
  categoryId?: string;
  isActive?: boolean;
  shortDescription?: string;
  prerequisites?: string;
  postInstructions?: string;
  featured?: boolean;
  requiresConsultant?: boolean;
  location?: "online" | "office";
}

export const APIService = { 
  async getAll(query?: GetServicesQuery): Promise<{ data: Service[]; total: number }> {
    try {
      const response = await apiClient.get<{ data: Service[]; total: number }>(API_ENDPOINTS.SERVICES.GET_ALL, { params: query });
      return response;
    } catch (error) {
      console.error("[APIService] Error fetching services:", error);
      throw error;
    }
  },

  async getById(id: string): Promise<Service> {
    try {
      const response = await apiClient.get<Service>(API_ENDPOINTS.SERVICES.BY_ID(id));
      return response;
    } catch (error) {
      console.error("[APIService] Error in getById:", error);
      throw error;
    }
  },

  async getStiServices(): Promise<Service[]> {
    try {
      const response = await apiClient.get<{ data: Service[] }>(API_ENDPOINTS.SERVICES.STI);
      return response.data || []; // Ensure it always returns an array, even if data is undefined
    } catch (error) {
      console.error("[APIService] Error in getStiServices:", error);
      throw error;
    }
  },

  async createService(data: CreateServiceDto): Promise<Service> {
    try {
      const response = await apiClient.post<Service>(API_ENDPOINTS.SERVICES.BASE, data);
      return response;
    } catch (error) {
      console.error("[APIService] Error creating service:", error);
      throw error;
    }
  },

  async updateService(id: string, data: UpdateServiceDto): Promise<Service> {
    try {
      const response = await apiClient.patch<Service>(API_ENDPOINTS.SERVICES.BY_ID(id), data);
      return response;
    } catch (error) {
      console.error("[APIService] Error updating service:", error);
      throw error;
    }
  },

  async deleteService(id: string): Promise<void> {
    try {
      await apiClient.delete<void>(API_ENDPOINTS.SERVICES.BY_ID(id));
    } catch (error) {
      console.error("[APIService] Error deleting service:", error);
      throw error;
    }
  },

  async uploadServiceImage(file: File, serviceId: string): Promise<UploadImageResponse> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("entityType", "service");
      formData.append("entityId", serviceId);
      formData.append("isPublic", "true"); // Assuming images for services are public

      const response = await apiClient.post<UploadImageResponse>(API_ENDPOINTS.FILES.UPLOAD_IMAGE, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response;
    } catch (error) {
      console.error("[APIService] Error uploading service image:", error);
      throw error;
    }
  },

  async addImageToService(serviceId: string, imageId: string): Promise<void> {
    try {
      const data: CreateServiceImageDto = { serviceId, imageId };
      await apiClient.post<void>(API_ENDPOINTS.SERVICES.ADD_IMAGE, data);
    } catch (error) {
      console.error("[APIService] Error adding image to service:", error);
      throw error;
    }
  },
};
