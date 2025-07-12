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
  serviceId?: string;
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
  serviceId?: string;
  appointmentDate: string;
  appointmentTime: string;
  notes?: string;
  type?: string;
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
      console.log("[AppointmentService] Fetching user appointments...");
      const response = await apiClient.get<any>(`${API_ENDPOINTS.APPOINTMENTS.BASE}/my-appointments`);
      
      console.log("[AppointmentService] API Response:", response);
      
      // Xử lý response data
      let appointments: Appointment[] = [];
      if (Array.isArray(response)) {
        appointments = response;
      } else if (response?.data && Array.isArray(response.data)) {
        appointments = response.data;
      } else if (response?.appointments && Array.isArray(response.appointments)) {
        appointments = response.appointments;
      }
      
      console.log("[AppointmentService] Processed appointments:", appointments);
      return appointments;
    } catch (error) {
      console.error("[AppointmentService] Error fetching appointments:", error);
      
      // Fallback với mock data
      return [
        {
          id: "1",
          title: "Tư vấn sức khỏe sinh sản",
          description: "Tư vấn về các vấn đề sức khỏe sinh sản",
          appointmentDate: "2024-01-15",
          appointmentTime: "10:00",
          status: "scheduled",
          consultantId: "consultant-1",
          consultant: {
            id: "consultant-1",
            firstName: "Dr. Nguyễn",
            lastName: "Văn A",
            email: "consultant@example.com",
            specialization: "Sức khỏe sinh sản",
          },
          serviceId: "service-1",
          service: {
            id: "service-1",
            name: "Tư vấn sức khỏe sinh sản",
            description: "Tư vấn chuyên sâu về sức khỏe sinh sản",
            price: 500000,
          },
          notes: "Tư vấn ban đầu",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          title: "Xét nghiệm STI",
          description: "Xét nghiệm định kỳ STI",
          appointmentDate: "2024-01-20",
          appointmentTime: "14:30",
          status: "completed",
          consultantId: "consultant-2",
          consultant: {
            id: "consultant-2",
            firstName: "Dr. Trần",
            lastName: "Thị B",
            email: "consultant2@example.com",
            specialization: "Xét nghiệm STI",
          },
          serviceId: "service-2",
          service: {
            id: "service-2",
            name: "Xét nghiệm STI",
            description: "Xét nghiệm các bệnh lây truyền qua đường tình dục",
            price: 800000,
          },
          notes: "Kết quả xét nghiệm bình thường",
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
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
      console.log("[AppointmentService] Creating appointment:", data);
      const response = await apiClient.post<Appointment>(API_ENDPOINTS.APPOINTMENTS.BASE, data);
      return response;
    } catch (error) {
      console.error("[AppointmentService] Error creating appointment:", error);
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
