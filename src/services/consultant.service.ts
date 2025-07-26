import { apiClient } from "./api";
import { API_ENDPOINTS } from "@/config/api";
import { format } from "date-fns";

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string; // Added profilePicture based on API response
  // Add other user fields as needed from the API response
}

export interface ConsultantProfile {
  id: string;
  specialties: string[];
  qualification: string;
  experience: string;
  bio: string;
  consultationFee: number;
  consultationFeeType: "hourly" | "per_session" | "per_service";
  sessionDurationMinutes: number;
  isAvailable: boolean;
  profileStatus: "active" | "on_leave" | "training" | "inactive" | "pending_approval" | "rejected";
  languages: string[];
  consultationTypes: ("online" | "office")[];
  createdAt: string;
  updatedAt: string;
  user: UserProfile;
  rating?: number;
}

export interface ConsultantAvailability {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  maxAppointments: number;
  location: string;
  recurring: boolean;
  specificDate: string;
  serviceId: string; // Added serviceId
  meetingLink?: string; // Added meetingLink
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  consultantProfile: ConsultantProfile;
}

export interface GetConsultantsQuery {
  page?: number;
  limit?: number;
  search?: string;
  specialties?: string;
  minConsultationFee?: number;
  maxConsultationFee?: number;
  consultationTypes?: "online" | "office";
  status?: "active" | "on_leave" | "training" | "inactive" | "pending_approval" | "rejected";
  isAvailable?: boolean;
  minRating?: number;
  sortBy?: "rating" | "consultationFee" | "specialties" | "consultationTypes" | "status" | "isAvailable" | "createdAt" | "updatedAt";
  sortOrder?: "ASC" | "DESC";
}

// This comment is added to trigger a recompile and ensure the latest code is used.
export const ConsultantService = {
  async getAll(query?: GetConsultantsQuery): Promise<{ data: ConsultantProfile[]; total: number }> {
    try {
      // Ensure that only active and available consultants are fetched by default
      const defaultQuery = {
        ...query,
        status: "active", // Filter by active status
        isAvailable: true, // Filter by available status
      };
      const response = await apiClient.get<{ data: ConsultantProfile[]; total: number }>(API_ENDPOINTS.CONSULTANTS.GET_ALL, { params: defaultQuery });
      return response;
    } catch (error) {
      console.error("[ConsultantService] Error fetching consultants:", error);
      throw error;
    }
  },
  async findConsultantAvailableSlots(consultantId: string, date: Date, serviceId?: string) {
    const formattedDate = format(date, "yyyy-MM-dd");
    const data: any = {
      consultantId: consultantId,
      startDate: formattedDate,
      endDate: formattedDate, // For a single day, set endDate to be the same as startDate
    };

    if (serviceId) {
      data.serviceIds = [serviceId];
    }

    const response = await apiClient.post<any>(API_ENDPOINTS.APPOINTMENTS.AVAILABLE_SLOTS, data);
    console.log("ConsultantService.findConsultantAvailableSlots Raw Response:", response);
    return response;
  },

  async approveConsultant(id: string): Promise<ConsultantProfile> {
    try {
      const response = await apiClient.patch<ConsultantProfile>(API_ENDPOINTS.CONSULTANTS.APPROVE(id));
      return response;
    } catch (error) {
      console.error(`Error approving consultant ${id}:`, error);
      throw error;
    }
  },

  async rejectConsultant(id: string, reason: string): Promise<ConsultantProfile> {
    try {
      const response = await apiClient.patch<ConsultantProfile>(API_ENDPOINTS.CONSULTANTS.REJECT(id), { reason });
      return response;
    } catch (error) {
      console.error(`Error rejecting consultant ${id}:`, error);
      throw error;
    }
  },

  async updateWorkingHours(id: string, workingHours: any): Promise<ConsultantProfile> {
    try {
      const response = await apiClient.patch<ConsultantProfile>(API_ENDPOINTS.CONSULTANTS.UPDATE_WORKING_HOURS(id), { workingHours });
      return response;
    } catch (error) {
      console.error(`Error updating working hours for consultant ${id}:`, error);
      throw error;
    }
  },

  async generateSchedule(id: string, weeksToGenerate: number): Promise<ConsultantProfile> {
    try {
      const response = await apiClient.post<ConsultantProfile>(API_ENDPOINTS.CONSULTANTS.GENERATE_SCHEDULE(id), { weeksToGenerate });
      return response;
    } catch (error) {
      console.error(`Error generating schedule for consultant ${id}:`, error);
      throw error;
    }
  },

  async ensureUpcomingSchedule(id: string): Promise<ConsultantProfile> {
    try {
      const response = await apiClient.post<ConsultantProfile>(API_ENDPOINTS.CONSULTANTS.ENSURE_UPCOMING_SCHEDULE(id));
      return response;
    } catch (error) {
      console.error(`Error ensuring upcoming schedule for consultant ${id}:`, error);
      throw error;
    }
  },

  async createConsultant(data: any): Promise<ConsultantProfile> {
    try {
      const response = await apiClient.post<ConsultantProfile>(API_ENDPOINTS.CONSULTANTS.REGISTER, data);
      return response;
    } catch (error) {
      console.error("Error creating consultant:", error);
      throw error;
    }
  },
};
