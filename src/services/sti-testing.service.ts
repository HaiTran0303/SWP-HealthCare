import { apiClient } from "@/services/api";
import { API_ENDPOINTS } from "@/config/api";

export interface StiTestProcess {
  id: string;
  testCode: string;
  status: string; // e.g., "ordered", "result_ready", "completed"
  sampleType: string;
  priority: string;
  estimatedResultDate?: string;
  actualResultDate?: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  service: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface GetStiTestProcessesParams {
  page?: number;
  limit?: number;
  status?: string;
  sampleType?: string;
  priority?: string;
  patientId?: string;
  consultantDoctorId?: string;
  serviceId?: string;
  testCode?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  requiresConsultation?: boolean;
  patientNotified?: boolean;
  hasResults?: boolean;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface GetStiTestProcessesResponse {
  data: StiTestProcess[];
  total: number;
  page: number;
  limit: number;
}

export const StiTestingService = {
  async getAll(params?: GetStiTestProcessesParams): Promise<GetStiTestProcessesResponse> {
    try {
      const query = new URLSearchParams();
      if (params) {
        // Map search term to relevant fields if needed, or create separate search parameters
        if (params.testCode) {
          query.append("testCode", params.testCode);
        }
        if (params.status) {
          query.append("status", params.status);
        }
        if (params.patientId) {
          query.append("patientId", params.patientId);
        }
        // Add other parameters as needed
        if (params.page) {
          query.append("page", String(params.page));
        }
        if (params.limit) {
          query.append("limit", String(params.limit));
        }
        if (params.sortBy) {
          query.append("sortBy", params.sortBy);
        }
        if (params.sortOrder) {
          query.append("sortOrder", params.sortOrder);
        }
      }
      const queryString = query.toString();
      const url = `${API_ENDPOINTS.STI_TESTING.BASE}/search${queryString ? `?${queryString}` : ""}`;
      
      const response = await apiClient.post<GetStiTestProcessesResponse>(url, params); // Using POST for search as per swagger
      return response;
    } catch (error) {
      console.error("Error fetching STI test processes:", error);
      throw error;
    }
  },

  // You can add other STI test process-related API calls here (e.g., updateStatus, getDetails)
};
