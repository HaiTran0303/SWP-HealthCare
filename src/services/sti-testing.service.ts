import { apiClient } from "./api";
import { API_ENDPOINTS } from "@/config/api";

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

export interface TestResult {
  testName: string;
  testCode: string;
  resultDate: Date;
  results: {
    parameterName: string;
    value: string;
    unit: string;
    referenceRange: string;
    status: "normal" | "abnormal" | "critical";
  }[];
  summary: string;
  recommendation: string;
  doctorNotes?: string;
  isConfidential: boolean;
}

export const STITestingService = {
  // Quản lý quy trình xét nghiệm
  async createTest(data: STITestData) {
    const payload = {
      ...data,
      estimatedResultDate: data.estimatedResultDate
        ? new Date(data.estimatedResultDate).toISOString()
        : undefined,
    };
    return apiClient.post(API_ENDPOINTS.STI_TESTING.BASE, payload);
  },

  async getAllTests(filters: TestFilters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    return apiClient.get(
      `${API_ENDPOINTS.STI_TESTING.BASE}?${params.toString()}`
    );
  },

  async getTestById(id: string) {
    return apiClient.get(`${API_ENDPOINTS.STI_TESTING.BASE}/${id}`);
  },

  async getTestByCode(testCode: string) {
    return apiClient.get(
      `${API_ENDPOINTS.STI_TESTING.BASE}/test-code/${testCode}`
    );
  },

  async updateTestStatus(id: string, status: TestStatus) {
    return apiClient.patch(`${API_ENDPOINTS.STI_TESTING.BASE}/${id}/status`, {
      status,
    });
  },

  // Quản lý kết quả xét nghiệm
  async submitTestResult(
    testId: string,
    resultData: Omit<TestResult, "testId">
  ) {
    const { resultDate, ...rest } = resultData;
    const payload = {
      testProcessId: testId,
      ...rest,
      resultDate: new Date(resultDate).toISOString(),
    };
    return apiClient.post(API_ENDPOINTS.STI_TESTING.RESULTS, payload);
  },

  async getTestResult(testId: string) {
    return apiClient.get(`${API_ENDPOINTS.STI_TESTING.RESULTS}/${testId}`);
  },

  async getTestTemplate(serviceType: string) {
    return apiClient.get(
      `${API_ENDPOINTS.STI_TESTING.TEMPLATES}/${serviceType}`
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
  hasAbnormalResults(results: TestResult["results"]): boolean {
    return results.some((result) => result.status !== "normal");
  },
};
