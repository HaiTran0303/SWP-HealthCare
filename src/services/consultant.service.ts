import { apiClient } from "./api";
import { API_ENDPOINTS } from "@/config/api";

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
  userId: string;
  firstName: string; // Keep for direct access if needed, but primary source is user.firstName
  lastName: string;  // Keep for direct access if needed, but primary source is user.lastName
  specialties: string[];
  qualification: string;
  experience: string;
  bio: string;
  consultationFee: number;
  isAvailable: boolean;
  rating: number;
  avatar: string; // This might be consultantProfile.user.profilePicture or similar
  availability: ConsultantAvailability[];
  user: UserProfile; // Added user profile
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
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  consultantProfile: ConsultantProfile;
}

export const ConsultantService = {
  async getAll(): Promise<ConsultantProfile[]> {
    // apiClient.get returns the data directly, which might be an object with a 'data' property
    const apiResponse = await apiClient.get<any>(API_ENDPOINTS.CONSULTANTS.AVAILABILITY);
    const availabilityData: ConsultantAvailability[] = Array.isArray(apiResponse.data) ? apiResponse.data : [];

    const uniqueConsultantsMap = new Map<string, ConsultantProfile>();
    availabilityData.forEach((availability: ConsultantAvailability) => {
      if (availability.consultantProfile) {
        uniqueConsultantsMap.set(availability.consultantProfile.id, availability.consultantProfile);
      }
    });
    return Array.from(uniqueConsultantsMap.values());
  },
  async getAvailability(consultantId: string, date: Date) {
    const dayOfWeek = date.getDay(); // 0 for Sunday, 1 for Monday, etc.
    let endpoint = `${API_ENDPOINTS.CONSULTANTS.AVAILABILITY}?consultantId=${consultantId}&dayOfWeek=${dayOfWeek}`;
    const response = await apiClient.get<ConsultantAvailability[]>(endpoint);
    console.log("ConsultantService.getAvailability Raw Response:", response); // Added log
    return response;
  },
};
