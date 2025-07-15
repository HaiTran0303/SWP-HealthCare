import { apiClient } from "./api";
import { API_ENDPOINTS } from "@/config/api";

export interface Appointment {
  id: string;
  title?: string;
  description?: string;
  appointmentDate: string;
  appointmentTime: string;
  status: "scheduled" | "completed" | "cancelled" | "pending";
  consultantId?: string;
  consultant?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
    specialization?: string;
  };
  serviceIds?: string[];
  service?: {
    id: string;
    name: string;
    description?: string;
    price?: number;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
  cancellationReason?: string;
  // Thêm các trường khác từ API thực tế
  userId?: string;
  type?: string;
  location?: string;
  duration?: number;
}

export interface CreateAppointmentRequest {
  consultantId: string;
  serviceIds?: string[]; // Change to array of service IDs
  appointmentDate: string; // This will now include both date and time in ISO format
  notes?: string;
  meetingLink?: string;
  appointmentLocation?: string; // This will now carry the "type" value
}

export interface UpdateAppointmentStatusRequest {
  status: "scheduled" | "completed" | "cancelled" | "pending";
  cancellationReason?: string;
}

export type AppointmentStatus = "scheduled" | "completed" | "cancelled" | "pending" | "confirmed" | "no_show";

export const AppointmentService = {
  // Lấy danh sách appointments của user hiện tại
  getUserAppointments: async (): Promise<Appointment[]> => {
    try {
      console.log("[AppointmentService] Fetching current user appointments...");
      // Gọi API /appointments. Backend sẽ xác định người dùng hiện tại từ token xác thực.
      const response = await apiClient.get<any>(API_ENDPOINTS.APPOINTMENTS.BASE);
      
      console.log("[AppointmentService] Raw API Response for current user appointments:", response);
      
      let appointments: Appointment[] = [];
      if (response && typeof response.data === 'object' && Array.isArray(response.data.data)) {
        appointments = response.data.data;
      } else if (response && Array.isArray(response.data)) {
        appointments = response.data;
      } else if (Array.isArray(response)) {
        appointments = response;
      }
      
      console.log("[AppointmentService] Processed user appointments:", appointments);
      return appointments;
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
  getAllAppointments: async (): Promise<Appointment[]> => {
    try {
      console.log("[AppointmentService] Fetching all appointments...");
      const response = await apiClient.get<any>(API_ENDPOINTS.APPOINTMENTS.BASE);
      
      let appointments: Appointment[] = [];
      if (Array.isArray(response)) {
        appointments = response;
      } else if (response?.data && Array.isArray(response.data)) {
        appointments = response.data;
      }
      
      return appointments;
    } catch (error) {
      console.error("[AppointmentService] Error fetching all appointments:", error);
      return [];
    }
  },

  // Lấy appointment theo ID
  getAppointmentById: async (id: string): Promise<Appointment | null> => {
    try {
      console.log("[AppointmentService] Fetching appointment by ID:", id);
      const response = await apiClient.get<Appointment>(`${API_ENDPOINTS.APPOINTMENTS.BASE}/${id}`);
      return response;
    } catch (error) {
      console.error("[AppointmentService] Error fetching appointment:", error);
      return null;
    }
  },

  // Tạo appointment mới
  createAppointment: async (data: CreateAppointmentRequest): Promise<Appointment> => {
    try {
      console.log("[AppointmentService] Creating appointment with data:", data);
      // Log headers being sent
      const accessToken =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;
      console.log("[AppointmentService] Sending with headers:", {
        Authorization: `Bearer ${accessToken}`,
      });

      const response = await apiClient.post<Appointment>(API_ENDPOINTS.APPOINTMENTS.BASE, data, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      console.log("[AppointmentService] Create appointment successful. Response:", response);
      return response;
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
  updateAppointmentStatus: async (id: string, data: UpdateAppointmentStatusRequest): Promise<Appointment> => {
    try {
      console.log("[AppointmentService] Updating appointment status:", id, data);
      const response = await apiClient.put<Appointment>(
        API_ENDPOINTS.APPOINTMENTS.STATUS(id),
        data
      );
      return response;
    } catch (error) {
      console.error("[AppointmentService] Error updating appointment status:", error);
      throw error;
    }
  },

  // Hủy appointment
  cancelAppointment: async (id: string, reason?: string): Promise<void> => {
    try {
      console.log("[AppointmentService] Cancelling appointment:", id, reason);
      await apiClient.post(API_ENDPOINTS.APPOINTMENTS.CANCEL(id), {
        cancellationReason: reason,
      });
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
      return response;
    } catch (error) {
      console.error("[AppointmentService] Error getting chat room:", error);
      throw error;
    }
  },

  // Utility methods
  getStatusText: (status: AppointmentStatus): string => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận";
      case "confirmed":
      case "scheduled":
        return "Đã xác nhận";
      case "cancelled":
        return "Đã hủy";
      case "completed":
        return "Hoàn thành";
      case "no_show":
        return "Không có mặt";
      default:
        return "Không xác định";
    }
  },

  canCancel: (status: AppointmentStatus): boolean => {
    return ["pending", "confirmed", "scheduled"].includes(status);
  },

  isPastAppointment: (appointmentDate: string): boolean => {
    return new Date(appointmentDate) < new Date();
  },
};
