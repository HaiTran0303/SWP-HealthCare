import { apiClient } from "./api";
import { API_ENDPOINTS } from "@/config/api";
import {
  CreateStiAppointmentDto,
  Appointment,
  FindAvailableSlotsDto,
  FindAvailableSlotsResponseDto,
  StiProcess, // Exported
} from "@/types/sti-appointment.d";
import {
  PaginationResponse,
  TestResultResponseDto,
  TestResultData,
} from "@/types/api.d"; // Import PaginationResponse and TestResult related DTOs
import { GetAppointmentsQuery } from "@/services/appointment.service"; // Import GetAppointmentsQuery

export type SampleType = "blood" | "urine" | "swab" | "saliva" | "other";
export type Priority = "normal" | "high" | "urgent";
export type TestStatus =
  | "ordered"
  | "sample_collection_scheduled"
  | "sample_collected"
  | "processing"
  | "result_ready"
  | "result_delivered"
  | "consultation_required"
  | "follow_up_scheduled"
  | "completed"
  | "cancelled";

export interface STITestData {
  serviceId: string;
  patientId?: string;
  sampleType: SampleType;
  priority: Priority;
  appointmentId?: string;
  estimatedResultDate?: Date | string;
  sampleCollectionLocation?: string;
  processNotes?: string;
  consultantDoctorId?: string;
  requiresConsultation?: boolean;
  isConfidential?: boolean;
}

// Re-export StiProcess from sti-appointment.d.ts
export type { StiProcess };

// Define UpdateStiTestProcessDto based on swagger
export interface UpdateStiTestProcessDto {
  serviceId?: string;
  patientId?: string;
  sampleType?: SampleType;
  priority?: Priority;
  appointmentId?: string;
  estimatedResultDate?: string;
  sampleCollectionLocation?: string;
  processNotes?: string;
  consultantDoctorId?: string;
  requiresConsultation?: boolean;
  isConfidential?: boolean;
  status?: TestStatus;
  actualResultDate?: string;
  sampleCollectionDate?: string;
  labNotes?: string;
  sampleCollectedBy?: string;
  labProcessedBy?: string;
  patientNotified?: boolean;
  resultEmailSent?: boolean;
}

export interface TestFilters {
  status?: TestStatus;
  sampleType?: SampleType;
  priority?: Priority;
  patientId?: string;
  consultantDoctorId?: string;
  serviceId?: string;
  testCode?: string;
  startDate?: string;
  endDate?: string;
  requiresConsultation?: boolean;
  patientNotified?: boolean;
  hasResults?: boolean;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  page?: number;
  limit?: number;
}

export const STITestingService = {
  // Quản lý quy trình xét nghiệm
  async createTest(data: STITestData): Promise<StiProcess> {
    const payload = {
      ...data,
      estimatedResultDate: data.estimatedResultDate
        ? new Date(data.estimatedResultDate).toISOString()
        : undefined,
    };
    return apiClient.post<StiProcess>(API_ENDPOINTS.STI_TESTING.BASE, payload);
  },

  async createStiAppointment(
    data: CreateStiAppointmentDto
  ): Promise<Appointment> {
    const payload = {
      ...data,
      sampleCollectionDate: data.sampleCollectionDate
        ? new Date(data.sampleCollectionDate).toISOString()
        : undefined,
    };
    return apiClient.post<Appointment>(
      API_ENDPOINTS.STI_TESTING.CREATE_STI_APPOINTMENT,
      payload
    );
  },

  async getAllTests(
    filters: TestFilters = {}
  ): Promise<PaginationResponse<StiProcess>> {
    try {
      const response = await apiClient.post<PaginationResponse<StiProcess>>(
        API_ENDPOINTS.STI_TESTING.GET_ALL_PROCESSES,
        filters
      );
      return response;
    } catch (error) {
      console.error("[STITestingService] Error fetching all tests:", error);
      throw error;
    }
  },

  async getTestById(id: string): Promise<StiProcess> {
    return apiClient.get<StiProcess>(`${API_ENDPOINTS.STI_TESTING.BASE}/${id}`);
  },

  async getTestByCode(testCode: string): Promise<StiProcess> {
    return apiClient.get<StiProcess>(
      `${API_ENDPOINTS.STI_TESTING.BASE}/test-code/${testCode}`
    );
  },

  async updateTestProcess(
    id: string,
    data: UpdateStiTestProcessDto
  ): Promise<StiProcess> {
    return apiClient.put<StiProcess>(
      `${API_ENDPOINTS.STI_TESTING.BASE}/${id}`,
      data
    );
  },

  async updateTestStatus(id: string, status: TestStatus): Promise<StiProcess> {
    return apiClient.patch<StiProcess>(
      `${API_ENDPOINTS.STI_TESTING.BASE}/${id}/status?status=${status}`
    );
  },

  async getBookingEstimation(data: {
    patientId: string;
    serviceIds: string[];
    notes?: string;
  }) {
    return apiClient.post<{ estimatedCost: number; estimatedDuration: string }>(
      `${API_ENDPOINTS.STI_TESTING.BASE}/booking/from-service-selection`,
      data
    );
  },

  // Quản lý kết quả xét nghiệm
  async getMyTestResults(): Promise<TestResultResponseDto[]> {
    const response = await apiClient.get<TestResultResponseDto[]>(
      API_ENDPOINTS.STI_TESTING.MY_TEST_RESULTS
    );
    return response;
  },

  async getMyTestResultDetails(id: string): Promise<TestResultResponseDto> {
    const response = await apiClient.get<TestResultResponseDto>(
      API_ENDPOINTS.STI_TESTING.MY_TEST_RESULT_DETAILS(id)
    );
    return response;
  },

  async exportStiTestResultPdf(stiProcessId: string): Promise<Blob> {
    const response = await apiClient.getBlob(
      API_ENDPOINTS.STI_TESTING.EXPORT_STI_TEST_RESULT_PDF(stiProcessId)
    );
    return response;
  },

  async getUserStiAppointments(query?: GetAppointmentsQuery): Promise<PaginationResponse<StiProcess>> {
    try {
      const response = await apiClient.get<PaginationResponse<StiProcess>>(API_ENDPOINTS.STI_TESTING.CREATE_STI_APPOINTMENT, { params: query });
      return response;
    } catch (error) {
      console.error("[STITestingService] Error fetching user STI appointments:", error);
      throw error;
    }
  },

  async getTestTemplate(serviceType: string) {
    return apiClient.get(
      `${API_ENDPOINTS.STI_TESTING.TEMPLATES}/${serviceType}`
    );
  },

  async getAvailableAppointmentSlots(
    data: FindAvailableSlotsDto
  ): Promise<FindAvailableSlotsResponseDto> {
    return apiClient.post<FindAvailableSlotsResponseDto>(
      API_ENDPOINTS.APPOINTMENTS.AVAILABLE_SLOTS,
      data
    );
  },

  // Các hàm tiện ích

  // Kiểm tra trạng thái quy trình
  isTestCompleted(status: TestStatus): boolean {
    return ["completed", "cancelled"].includes(status);
  },

  // Kiểm tra xem có thể chuyển sang trạng thái tiếp theo
  canTransitionTo(currentStatus: TestStatus, nextStatus: TestStatus): boolean {
    const workflow: Record<TestStatus, TestStatus[]> = {
      ordered: ["sample_collection_scheduled", "cancelled"],
      sample_collection_scheduled: ["sample_collected", "cancelled"],
      sample_collected: ["processing", "cancelled"],
      processing: ["result_ready", "cancelled"],
      result_ready: ["result_delivered", "consultation_required"],
      result_delivered: ["completed", "consultation_required"],
      consultation_required: ["follow_up_scheduled", "completed"],
      follow_up_scheduled: ["completed"],
      completed: [],
      cancelled: [],
    };
    return workflow[currentStatus]?.includes(nextStatus) || false;
  },

  // Lấy text hiển thị cho trạng thái
  getStatusText(status: TestStatus): string {
    const statusMap: Record<TestStatus, string> = {
      ordered: "Đã đặt lịch",
      sample_collection_scheduled: "Đã lên lịch lấy mẫu",
      sample_collected: "Đã lấy mẫu",
      processing: "Đang xử lý",
      result_ready: "Có kết quả",
      result_delivered: "Đã gửi kết quả",
      consultation_required: "Yêu cầu tư vấn",
      follow_up_scheduled: "Đã lên lịch tái khám",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
    };
    return statusMap[status];
  },

  // Lấy màu hiển thị cho trạng thái
  getStatusColor(status: TestStatus): string {
    const colorMap: Record<TestStatus, string> = {
      ordered: "gray",
      sample_collection_scheduled: "blue",
      sample_collected: "blue",
      processing: "yellow",
      result_ready: "green",
      result_delivered: "green",
      consultation_required: "orange",
      follow_up_scheduled: "purple",
      completed: "green",
      cancelled: "red",
    };
    return colorMap[status];
  },

  // Tính thời gian dự kiến có kết quả
  calculateEstimatedResultDate(
    sampleCollectionDate: Date | string,
    testType: string
  ): Date {
    const collection = new Date(sampleCollectionDate);
    // Thời gian xử lý mặc định cho các loại xét nghiệm
    const processingDays: Record<string, number> = {
      basic: 2,
      comprehensive: 5,
      rapid: 1,
    };
    const days = processingDays[testType] || 3;
    return new Date(collection.setDate(collection.getDate() + days));
  },

  // Kiểm tra xem kết quả có bất thường không
  hasAbnormalResults(results: TestResultData["results"]): boolean {
    return results.some((result) => result.status !== "normal");
  },
};
