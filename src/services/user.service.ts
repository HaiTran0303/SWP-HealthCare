import { apiClient } from "./api";
import { API_ENDPOINTS } from "@/config/api";
import { ConsultantProfile } from "./consultant.service"; // Import ConsultantProfile

export interface User {
  id: string;
  fullName?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  gender?: string;
  dateOfBirth?: string;
  profilePicture?: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roleId?: string; // Add roleId here for convenience in forms
  consultantProfile?: ConsultantProfile; // Add consultantProfile
}

export interface Role {
  id: string;
  name: string;
  description?: string;
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

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone?: string;
  address?: string;
  gender?: string;
  roleId: string;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  address?: string;
  roleId?: string;
  profilePicture?: string;
  locale?: string;
  healthDataConsent?: boolean;
}

export class UserService {
  static async createUser(payload: CreateUserPayload): Promise<User> {
    try {
      const response = await apiClient.post<User>(API_ENDPOINTS.USERS.CREATE, payload);
      return response;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  static async updateUser(id: string, payload: UpdateUserPayload): Promise<User> {
    try {
      const response = await apiClient.patch<User>(`${API_ENDPOINTS.USERS.BASE}/${id}`, payload);
      return response;
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
      throw error;
    }
  }

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

  static async getAllRoles(): Promise<Role[]> {
    try {
      const response = await apiClient.get<Role[]>(API_ENDPOINTS.ROLES.GET_ALL);
      return response;
    } catch (error) {
      console.error("Error fetching roles:", error);
      throw error;
    }
  }
}
