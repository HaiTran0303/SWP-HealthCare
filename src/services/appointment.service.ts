import { apiClient } from "@/services/api";
import { API_ENDPOINTS } from "@/config/api";

export interface Appointment {
  id: string;
  appointmentDate: string;
  appointmentLocation: "online" | "office";
  status: string; // e.g., "pending", "confirmed", "completed", "cancelled"
  notes?: string;
  meetingLink?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  consultant: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  services: Array<{
    id: string;
    name: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface GetAppointmentsParams {
  page?: number;
  limit?: number;
  userId?: string;
  consultantId?: string;
  status?: string;
  fromDate?: string; // YYYY-MM-DD
  toDate?: string;   // YYYY-MM-DD
  sortBy?: "appointmentDate" | "createdAt" | "updatedAt";
  sortOrder?: "ASC" | "DESC";
}

export interface GetAppointmentsResponse {
  data: Appointment[];
  total: number;
  page: number;
  limit: number;
}

export const AppointmentService = {
  async getAll(params?: GetAppointmentsParams): Promise<GetAppointmentsResponse> {
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
      const url = `${API_ENDPOINTS.APPOINTMENTS.BASE}${queryString ? `?${queryString}` : ""}`;
      
      const response = await apiClient.get<GetAppointmentsResponse>(url);
      return response;
    } catch (error) {
      console.error("Error fetching appointments:", error);
      throw error;
    }
  },

  // You can add other appointment-related API calls here (e.g., updateStatus, cancel)
};
