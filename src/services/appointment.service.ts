import { apiClient } from "./api";
import { API_ENDPOINTS } from "@/config/api";
import { Appointment, PaginationResponse } from "@/types/api.d";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "checked_in"
  | "in_progress"
  | "no_show"
  | "rescheduled";

export type { Appointment }; // Export Appointment type

export interface CreateAppointmentRequest {
  consultantId?: string;
  serviceIds?: string[];
  appointmentDate: string; // ISO 8601 format
  notes?: string;
  meetingLink?: string;
  appointmentLocation: "online" | "office"; // Must be explicitly defined as per swagger
}

export interface GetAppointmentsQuery {
  page?: number;
  limit?: number;
  userId?: string;
  consultantId?: string;
  status?: AppointmentStatus; // Use status from global Appointment type
  fromDate?: string; // YYYY-MM-DD
  toDate?: string; // YYYY-MM-DD
  sortBy?: "appointmentDate" | "createdAt" | "updatedAt";
  sortOrder?: "ASC" | "DESC";
}

export interface UpdateAppointmentDto {
  status?: AppointmentStatus; // Make optional
  meetingLink?: string;
  chatRoomId?: string; // Add chatRoomId
}

export interface CancelAppointmentDto {
  cancellationReason?: string;
}

export const AppointmentService = {
  // Lấy danh sách appointments của user hiện tại
  getUserAppointments: async (query?: GetAppointmentsQuery): Promise<PaginationResponse<Appointment>> => {
    try {
      console.log("[AppointmentService] Fetching current user appointments...");
      const response = await apiClient.get<PaginationResponse<Appointment>>(API_ENDPOINTS.APPOINTMENTS.BASE, { params: query });
      console.log("[AppointmentService] Raw API Response for current user appointments:", response);
      return response; // The apiClient already returns the expected structure
    } catch (error: any) {
      console.error("[AppointmentService] Error fetching user appointments:", error);
      if (error.response) {
        console.error("[AppointmentService] Error response data:", error.response.data);
        console.error("[AppointmentService] Error response status:", error.response.status);
        console.error("[AppointmentService] Error response headers:", error.response.headers);
      } else if (error.request) {
        console.error("[AppointmentService] Error request:", error.request);
      } else {
        console.error("[AppointmentService] Error message:", error.message);
      }
      throw error;
    }
  },

  // Lấy tất cả appointments (cho admin/consultant)
  getAllAppointments: async (query?: GetAppointmentsQuery): Promise<PaginationResponse<Appointment>> => {
    try {
      console.log("[AppointmentService] Fetching all appointments...");
      const response = await apiClient.get<PaginationResponse<Appointment>>(API_ENDPOINTS.APPOINTMENTS.GET_ALL, { params: query });
      return response; // The apiClient already returns the expected structure
    } catch (error) {
      console.error("[AppointmentService] Error fetching all appointments:", error);
      throw error;
    }
  },

  // Lấy appointment theo ID
  getAppointmentById: async (id: string): Promise<Appointment | null> => {
    try {
      console.log("[AppointmentService] Fetching appointment by ID:", id);
      const response = await apiClient.get<Appointment>(`${API_ENDPOINTS.APPOINTMENTS.BASE}/${id}`);
      return response; // The apiClient returns the Appointment object directly
    } catch (error) {
      console.error("[AppointmentService] Error fetching appointment:", error);
      return null;
    }
  },

  // Tạo appointment mới
  createAppointment: async (data: CreateAppointmentRequest): Promise<Appointment> => {
    try {
      console.log("[AppointmentService] Creating appointment with data:", data);
      const accessToken = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      console.log("[AppointmentService] Sending with headers:", {
        Authorization: `Bearer ${accessToken}`,
      });

      const response = await apiClient.post<Appointment>(API_ENDPOINTS.APPOINTMENTS.BASE, data, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      console.log("[AppointmentService] Create appointment successful. Response:", response);
      return response; // The apiClient returns the Appointment object directly
    } catch (error: any) {
      console.error("[AppointmentService] Error creating appointment:", error);
      if (error.response) {
        console.error("[AppointmentService] Error response data:", error.response.data);
        console.error("[AppointmentService] Error response status:", error.response.status);
        console.error("[AppointmentService] Error response headers:", error.response.headers);
      } else if (error.request) {
        console.error("[AppointmentService] Error request:", error.request);
      } else {
        console.error("[AppointmentService] Error message:", error.message);
      }
      throw error;
    }
  },

  // Cập nhật trạng thái appointment
  updateAppointment: async (id: string, data: Partial<Appointment>): Promise<Appointment> => {
    try {
      console.log("[AppointmentService] Updating appointment:", id, data);
      const response = await apiClient.patch<Appointment>(
        `${API_ENDPOINTS.APPOINTMENTS.BASE}/${id}`, // Assuming PATCH /appointments/{id} is the general update endpoint
        data
      );
      return response;
    } catch (error) {
      console.error("[AppointmentService] Error updating appointment:", error);
      throw error;
    }
  },

  // Cập nhật trạng thái appointment (giữ lại cho các trường hợp chỉ cập nhật trạng thái)
  updateAppointmentStatus: async (id: string, data: UpdateAppointmentDto): Promise<Appointment> => {
    try {
      console.log("[AppointmentService] Updating appointment status:", id, data);
      const response = await apiClient.patch<Appointment>(
        API_ENDPOINTS.APPOINTMENTS.UPDATE_STATUS(id),
        data
      );
      return response; // The apiClient returns the Appointment object directly
    } catch (error) {
      console.error("[AppointmentService] Error updating appointment status:", error);
      throw error;
    }
  },

  // Hủy appointment
  cancelAppointment: async (id: string, data: CancelAppointmentDto): Promise<void> => {
    try {
      console.log("[AppointmentService] Cancelling appointment:", id, data);
      await apiClient.patch<void>(API_ENDPOINTS.APPOINTMENTS.CANCEL(id), data);
    } catch (error) {
      console.error("[AppointmentService] Error cancelling appointment:", error);
      throw error;
    }
  },

  // Lấy chat room cho appointment
  getAppointmentChatRoom: async (id: string): Promise<any> => {
    try {
      console.log("[AppointmentService] Getting chat room for appointment:", id);
      const response = await apiClient.get<any>(API_ENDPOINTS.APPOINTMENTS.CHAT_ROOM(id));
      return response; // The apiClient returns the response object directly
    } catch (error) {
      console.error("[AppointmentService] Error getting chat room:", error);
      throw error;
    }
  },

  // Utility methods
  getStatusText: (status: Appointment["status"]): string => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận";
      case "confirmed":
        return "Đã xác nhận";
      case "cancelled":
        return "Đã hủy";
      case "completed":
        return "Hoàn thành";
      case "checked_in":
        return "Đã check-in";
      case "in_progress":
        return "Đang tiến hành";
      case "no_show":
        return "Không có mặt";
      default:
        return "Không xác định";
    }
  },

  canCancel: (status: Appointment["status"]): boolean => {
    return ["pending", "confirmed"].includes(status);
  },

  isPastAppointment: (appointmentDate: string): boolean => {
    return new Date(appointmentDate) < new Date();
  },
};
