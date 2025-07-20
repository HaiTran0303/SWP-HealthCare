import { apiClient } from "@/services/api";
import { API_ENDPOINTS } from "@/config/api";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: {
    id: string;
    name: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
  roleId?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface GetUsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
}

export const UserService = {
  async getAll(params?: GetUsersParams): Promise<GetUsersResponse> {
    try {
      const query = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query.append(key, String(value));
          }
        });
      }
      const queryString = query.toString();
      const url = `${API_ENDPOINTS.USERS.BASE}${queryString ? `?${queryString}` : ""}`;
      
      const response = await apiClient.get<GetUsersResponse>(url);
      return response; // apiClient.get now returns the full response with pagination metadata
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  // You can add other user-related API calls here (e.g., createUser, updateUser, deleteUser)
};
