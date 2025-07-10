import { apiClient } from "./api";
import { API_ENDPOINTS } from "@/config/api";

export interface CycleData {
  cycleStartDate: Date | string;
  cycleEndDate?: Date | string;
  notes?: string;
}

export interface MoodData {
  cycleId: string;
  moodId: string;
  intensity: number;
  notes?: string;
}

export interface SymptomData {
  cycleId: string;
  symptomId: string;
  intensity: number;
  notes?: string;
}

export interface Prediction {
  nextPeriodDate: Date;
  fertileWindowStart: Date;
  fertileWindowEnd: Date;
  ovulationDate: Date;
  accuracy: number;
}

export const MenstrualService = {
  // Quản lý chu kỳ
  async createCycle(data: CycleData) {
    return apiClient.post(API_ENDPOINTS.CYCLES.BASE, {
      ...data,
      cycleStartDate: new Date(data.cycleStartDate).toISOString(),
      cycleEndDate: data.cycleEndDate
        ? new Date(data.cycleEndDate).toISOString()
        : undefined,
    });
  },

  async getAllCycles() {
    return apiClient.get(API_ENDPOINTS.CYCLES.BASE);
  },

  async getCycle(id: string) {
    return apiClient.get(`${API_ENDPOINTS.CYCLES.BASE}/${id}`);
  },

  async updateCycle(id: string, data: Partial<CycleData>) {
    return apiClient.patch(`${API_ENDPOINTS.CYCLES.BASE}/${id}`, {
      ...data,
      cycleStartDate: data.cycleStartDate
        ? new Date(data.cycleStartDate).toISOString()
        : undefined,
      cycleEndDate: data.cycleEndDate
        ? new Date(data.cycleEndDate).toISOString()
        : undefined,
    });
  },

  async deleteCycle(id: string) {
    return apiClient.delete(`${API_ENDPOINTS.CYCLES.BASE}/${id}`);
  },

  // Quản lý tâm trạng
  async addMood(data: MoodData) {
    return apiClient.post(API_ENDPOINTS.CYCLES.MOODS, data);
  },

  async getMoods(cycleId: string) {
    return apiClient.get(`${API_ENDPOINTS.CYCLES.MOODS}?cycleId=${cycleId}`);
  },

  async updateMood(id: string, data: Partial<MoodData>) {
    return apiClient.patch(`${API_ENDPOINTS.CYCLES.MOODS}/${id}`, data);
  },

  async deleteMood(id: string) {
    return apiClient.delete(`${API_ENDPOINTS.CYCLES.MOODS}/${id}`);
  },

  // Quản lý triệu chứng
  async addSymptom(data: SymptomData) {
    return apiClient.post(API_ENDPOINTS.CYCLES.SYMPTOMS, data);
  },

  async getSymptoms(cycleId: string) {
    return apiClient.get(`${API_ENDPOINTS.CYCLES.SYMPTOMS}?cycleId=${cycleId}`);
  },

  async updateSymptom(id: string, data: Partial<SymptomData>) {
    return apiClient.patch(`${API_ENDPOINTS.CYCLES.SYMPTOMS}/${id}`, data);
  },

  async deleteSymptom(id: string) {
    return apiClient.delete(`${API_ENDPOINTS.CYCLES.SYMPTOMS}/${id}`);
  },

  // Dự đoán chu kỳ
  async getPredictions(): Promise<Prediction> {
    return apiClient.get(API_ENDPOINTS.CYCLES.PREDICTIONS);
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
