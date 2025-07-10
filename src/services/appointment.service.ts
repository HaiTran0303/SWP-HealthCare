import { apiClient } from "./api";
import { API_ENDPOINTS } from "@/config/api";

export interface AppointmentData {
  serviceIds: string[];
  consultantId: string;
  appointmentDate: Date | string;
  appointmentLocation: "online" | "office";
  notes?: string;
  meetingLink?: string;
}

export interface AppointmentFilters {
  page?: number;
  limit?: number;
  userId?: string;
  consultantId?: string;
  status?: AppointmentStatus;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no_show";

export interface UpdateStatusData {
  status: AppointmentStatus;
  meetingLink?: string;
}

export interface CancellationData {
  cancellationReason: string;
}

export const AppointmentService = {
  async create(data: AppointmentData) {
    return apiClient.post(API_ENDPOINTS.APPOINTMENTS.BASE, {
      ...data,
      appointmentDate: new Date(data.appointmentDate).toISOString(),
    });
  },

  async getAll(filters: AppointmentFilters = {}) {
    const params = new URLSearchParams();

    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.userId) params.append("userId", filters.userId);
    if (filters.consultantId)
      params.append("consultantId", filters.consultantId);
    if (filters.status) params.append("status", filters.status);
    if (filters.fromDate) params.append("fromDate", filters.fromDate);
    if (filters.toDate) params.append("toDate", filters.toDate);
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

    return apiClient.get(
      `${API_ENDPOINTS.APPOINTMENTS.BASE}?${params.toString()}`
    );
  },

  async getById(id: string) {
    return apiClient.get(`${API_ENDPOINTS.APPOINTMENTS.BASE}/${id}`);
  },

  async updateStatus(id: string, data: UpdateStatusData) {
    return apiClient.patch(API_ENDPOINTS.APPOINTMENTS.STATUS(id), data);
  },

  async cancel(id: string, data: CancellationData) {
    return apiClient.patch(API_ENDPOINTS.APPOINTMENTS.CANCEL(id), data);
  },

  async getChatRoom(id: string) {
    return apiClient.get(API_ENDPOINTS.APPOINTMENTS.CHAT_ROOM(id));
  },

  // Các hàm tiện ích cho appointments

  // Kiểm tra xem cuộc hẹn có thể bị hủy không
  canCancel(status: AppointmentStatus): boolean {
    return ["pending", "confirmed"].includes(status);
  },

  // Kiểm tra xem cuộc hẹn có thể được chỉnh sửa không
  canEdit(status: AppointmentStatus): boolean {
    return ["pending"].includes(status);
  },

  // Kiểm tra xem cuộc hẹn có thể được xác nhận không
  canConfirm(status: AppointmentStatus): boolean {
    return ["pending"].includes(status);
  },

  // Kiểm tra xem cuộc hẹn có thể được đánh dấu là hoàn thành không
  canComplete(status: AppointmentStatus): boolean {
    return ["confirmed"].includes(status);
  },

  // Chuyển đổi trạng thái thành text hiển thị
  getStatusText(status: AppointmentStatus): string {
    const statusMap: Record<AppointmentStatus, string> = {
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      cancelled: "Đã hủy",
      completed: "Hoàn thành",
      no_show: "Không đến",
    };
    return statusMap[status];
  },

  // Lấy màu badge theo trạng thái
  getStatusColor(status: AppointmentStatus): string {
    const colorMap: Record<AppointmentStatus, string> = {
      pending: "yellow",
      confirmed: "blue",
      cancelled: "red",
      completed: "green",
      no_show: "gray",
    };
    return colorMap[status];
  },

  // Kiểm tra xem một cuộc hẹn có phải trong quá khứ không
  isPastAppointment(appointmentDate: Date | string): boolean {
    const appointment = new Date(appointmentDate);
    const now = new Date();
    return appointment < now;
  },

  // Kiểm tra xem một cuộc hẹn có sắp diễn ra không (trong vòng 24h)
  isUpcoming(appointmentDate: Date | string): boolean {
    const appointment = new Date(appointmentDate);
    const now = new Date();
    const diff = appointment.getTime() - now.getTime();
    const hours = diff / (1000 * 60 * 60);
    return hours > 0 && hours <= 24;
  },
};
