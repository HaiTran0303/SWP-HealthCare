import { apiClient } from "./api";
import { API_ENDPOINTS } from "@/config/api";
import { ApiResponse } from "@/types/api.d";

export interface CycleData {
  id: string;
  cycleStartDate: Date | string;
  cycleEndDate?: Date | string;
  notes?: string;
}

export interface CreateCycleDto {
  cycleStartDate: Date | string;
  cycleEndDate?: Date | string;
  notes?: string;
}

export interface SymptomData {
  cycleId: string;
  symptomId: string;
  intensity: number;
  notes?: string;
}

export interface Symptom {
  id: string;
  name: string;
}

export interface Prediction {
  predictedCycleStart?: string;
  predictedCycleEnd?: string;
  predictedOvulationDate?: string;
  predictedFertileStart?: string;
  predictedFertileEnd?: string;
  accuracy?: number;
  data?: {
    predictedCycleStart?: string;
    predictedCycleEnd?: string;
    predictedOvulationDate?: string;
    predictedFertileStart?: string;
    predictedFertileEnd?: string;
    accuracy?: number;
  };
}

// Interfaces for Contraceptive Reminders
export interface ContraceptiveReminder {
  id: string;
  userId: string;
  contraceptiveType: string;
  reminderTime: string; // HH:mm
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  frequency: 'daily' | 'weekly' | 'monthly';
  daysOfWeek?: number[]; // 0=Sunday, 1=Monday, ..., 6=Saturday
  reminderMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContraceptiveReminderDto {
  contraceptiveType: string;
  reminderTime: string;
  startDate: string;
  endDate?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  daysOfWeek?: number[];
  reminderMessage?: string;
}

export interface UpdateContraceptiveReminderDto {
  contraceptiveType?: string;
  reminderTime?: string;
  startDate?: string;
  endDate?: string;
  frequency?: 'daily' | 'weekly' | 'monthly';
  daysOfWeek?: number[];
  reminderMessage?: string;
}


export const MenstrualService = {
  // Quản lý chu kỳ
  async createCycle(data: CreateCycleDto): Promise<ApiResponse<any>> {
    return (await apiClient.post(API_ENDPOINTS.CYCLES.BASE, {
      ...data,
      cycleStartDate: new Date(data.cycleStartDate).toISOString(),
      cycleEndDate: data.cycleEndDate
        ? new Date(data.cycleEndDate).toISOString()
        : undefined,
    })) as ApiResponse<any>;
  },

  async getAllCycles(): Promise<ApiResponse<CycleData[]>> {
    return (await apiClient.get(API_ENDPOINTS.CYCLES.BASE)) as ApiResponse<CycleData[]>;
  },

  async getCycle(id: string): Promise<ApiResponse<CycleData>> {
    return (await apiClient.get(`${API_ENDPOINTS.CYCLES.BASE}/${id}`)) as ApiResponse<CycleData>;
  },

  async updateCycle(id: string, data: Partial<CycleData>): Promise<ApiResponse<any>> {
    return (await apiClient.patch(`${API_ENDPOINTS.CYCLES.BASE}/${id}`, {
      ...data,
      cycleStartDate: data.cycleStartDate
        ? new Date(data.cycleStartDate).toISOString()
        : undefined,
      cycleEndDate: data.cycleEndDate
        ? new Date(data.cycleEndDate).toISOString()
        : undefined,
    })) as ApiResponse<any>;
  },

  async deleteCycle(id: string): Promise<ApiResponse<any>> {
    return (await apiClient.delete(`${API_ENDPOINTS.CYCLES.BASE}/${id}`)) as ApiResponse<any>;
  },

  // Quản lý triệu chứng
  async addSymptom(data: SymptomData): Promise<ApiResponse<any>> {
    return (await apiClient.post(API_ENDPOINTS.CYCLES.SYMPTOMS, data)) as ApiResponse<any>;
  },

  async getAllSymptoms(): Promise<ApiResponse<Symptom[]>> {
    return (await apiClient.get(API_ENDPOINTS.SYMPTOMS.BASE)) as ApiResponse<Symptom[]>;
  },

  async getSymptomsByCycleId(cycleId: string): Promise<ApiResponse<SymptomData[]>> {
    return (await apiClient.get(`${API_ENDPOINTS.CYCLES.SYMPTOMS}?cycleId=${cycleId}`)) as ApiResponse<SymptomData[]>;
  },

  async updateSymptom(id: string, data: Partial<SymptomData>): Promise<ApiResponse<any>> {
    return (await apiClient.patch(`${API_ENDPOINTS.CYCLES.SYMPTOMS}/${id}`, data)) as ApiResponse<any>;
  },

  async deleteSymptom(id: string): Promise<ApiResponse<any>> {
    return (await apiClient.delete(`${API_ENDPOINTS.CYCLES.SYMPTOMS}/${id}`)) as ApiResponse<any>;
  },

  // Dự đoán chu kỳ
  async getPredictions(): Promise<Prediction> {
    const res: ApiResponse<Prediction> = (await apiClient.get(API_ENDPOINTS.CYCLES.PREDICTIONS)) as ApiResponse<Prediction>;
    return res.data || (res as unknown as Prediction); // Casting to Prediction if data is not directly available
  },

  // Quản lý nhắc nhở tránh thai
  async createContraceptiveReminder(data: CreateContraceptiveReminderDto): Promise<ApiResponse<ContraceptiveReminder>> {
    return (await apiClient.post(API_ENDPOINTS.CONTRACEPTIVE_REMINDERS.BASE, data)) as ApiResponse<ContraceptiveReminder>;
  },

  async getAllContraceptiveReminders(): Promise<ApiResponse<ContraceptiveReminder[]>> {
    return (await apiClient.get(API_ENDPOINTS.CONTRACEPTIVE_REMINDERS.BASE)) as ApiResponse<ContraceptiveReminder[]>;
  },

  async getContraceptiveReminder(id: string): Promise<ApiResponse<ContraceptiveReminder>> {
    return (await apiClient.get(API_ENDPOINTS.CONTRACEPTIVE_REMINDERS.BY_ID(id))) as ApiResponse<ContraceptiveReminder>;
  },

  async updateContraceptiveReminder(id: string, data: UpdateContraceptiveReminderDto): Promise<ApiResponse<ContraceptiveReminder>> {
    return (await apiClient.put(API_ENDPOINTS.CONTRACEPTIVE_REMINDERS.BY_ID(id), data)) as ApiResponse<ContraceptiveReminder>;
  },

  async deleteContraceptiveReminder(id: string): Promise<ApiResponse<any>> {
    return (await apiClient.delete(API_ENDPOINTS.CONTRACEPTIVE_REMINDERS.BY_ID(id))) as ApiResponse<any>;
  },

  // Các hàm tiện ích

  // Tính độ dài chu kỳ
  calculateCycleLength(
    startDate: Date | string,
    endDate: Date | string
  ): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  // Tính ngày dự kiến của chu kỳ tiếp theo
  predictNextCycle(
    lastCycleStart: Date | string,
    averageCycleLength: number
  ): Date {
    const lastStart = new Date(lastCycleStart);
    return new Date(
      lastStart.setDate(lastStart.getDate() + averageCycleLength)
    );
  },

  // Tính thời điểm rụng trứng dự kiến
  predictOvulation(cycleStartDate: Date | string, cycleLength: number): Date {
    const start = new Date(cycleStartDate);
    // Thông thường rụng trứng xảy ra 14 ngày trước chu kỳ tiếp theo
    return new Date(start.setDate(start.getDate() + (cycleLength - 14)));
  },

  // Tính khoảng thời gian dễ thụ thai
  calculateFertileWindow(ovulationDate: Date): { start: Date; end: Date } {
    const start = new Date(ovulationDate);
    const end = new Date(ovulationDate);
    // Khoảng thời gian dễ thụ thai là 5 ngày trước và 1 ngày sau rụng trứng
    start.setDate(start.getDate() - 5);
    end.setDate(end.getDate() + 1);
    return { start, end };
  },

  // Kiểm tra xem một ngày có phải là ngày trong chu kỳ không
  isInPeriod(date: Date, cycles: CycleData[]): boolean {
    return cycles.some((cycle) => {
      const start = new Date(cycle.cycleStartDate);
      const end = cycle.cycleEndDate ? new Date(cycle.cycleEndDate) : null;
      if (!end) return false;
      return date >= start && date <= end;
    });
  },

  // Tính chu kỳ trung bình
  calculateAverageCycle(cycles: CycleData[]): number {
    if (cycles.length < 2) return 28; // Giá trị mặc định

    const lengths = cycles.slice(0, -1).map((cycle, index) => {
      const nextCycle = cycles[index + 1];
      return this.calculateCycleLength(
        cycle.cycleStartDate,
        nextCycle.cycleStartDate
      );
    });

    const sum = lengths.reduce((acc, length) => acc + length, 0);
    return Math.round(sum / lengths.length);
  },
};
