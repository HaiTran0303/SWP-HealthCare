import { apiClient } from "./api";
import { API_ENDPOINTS } from "@/config/api";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  gender?: string;
  dateOfBirth?: string;
  profilePicture?: string;
  role: { id: string; name: string };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetUsersQuery {
  page?: number;
  limit?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  roleId?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export class UserService {
  static async getAllUsers(query?: GetUsersQuery): Promise<{ data: User[]; total: number }> {
    try {
      const response = await apiClient.get<{ data: User[]; total: number }>(API_ENDPOINTS.USERS.GET_ALL, { params: query });
      return response;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }

  static async toggleUserActiveStatus(id: string): Promise<User> {
    try {
      const response = await apiClient.put<User>(API_ENDPOINTS.USERS.TOGGLE_ACTIVE(id));
      return response;
    } catch (error) {
      console.error(`Error toggling user ${id} status:`, error);
      throw error;
    }
  }

  static async verifyUserEmail(id: string): Promise<User> {
    try {
      const response = await apiClient.put<User>(API_ENDPOINTS.USERS.VERIFY_EMAIL(id));
      return response;
    } catch (error) {
      console.error(`Error verifying user ${id} email:`, error);
      throw error;
    }
  }

  static async getUserById(id: string): Promise<User> {
    try {
      const response = await apiClient.get<User>(`${API_ENDPOINTS.USERS.BASE}/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      throw error;
    }
  }
}
