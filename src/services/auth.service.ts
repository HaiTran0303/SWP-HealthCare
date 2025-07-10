import { apiClient } from "./api";
import { API_ENDPOINTS } from "@/config/api";

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  gender: string;
}

interface ResetPasswordData {
  token: string;
  password: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const AuthService = {
  async login(data: LoginData) {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGIN, data);
  },

  async register(data: RegisterData) {
    return apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data);
  },

  async resendVerificationEmail(email: string) {
    return apiClient.post(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, { email });
  },

  async logout() {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  async getCurrentUser() {
    return apiClient.get(API_ENDPOINTS.AUTH.ME);
  },

  async verifyEmail(token: string) {
    return apiClient.get(`${API_ENDPOINTS.AUTH.VERIFY_EMAIL}?token=${token}`);
  },

  async forgotPassword(email: string) {
    return apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  },

  async resetPassword(data: ResetPasswordData) {
    return apiClient.put(`${API_ENDPOINTS.AUTH.RESET_PASSWORD}/${data.token}`, {
      password: data.password,
    });
  },

  async changePassword(data: ChangePasswordData) {
    return apiClient.put(API_ENDPOINTS.USERS.CHANGE_PASSWORD, data);
  },

  async updateProfile(data: Partial<Omit<RegisterData, "password">>) {
    return apiClient.patch(API_ENDPOINTS.USERS.PROFILE, data);
  },

  async uploadAvatar(file: File) {
    return apiClient.upload(API_ENDPOINTS.FILES.UPLOAD_IMAGE, file, {
      headers: {
        "entity-type": "user",
      },
    });
  },
};

// Type guard để kiểm tra xem user có phải là admin không
export function isAdmin(user: any): boolean {
  return user?.role === "admin";
}

// Type guard để kiểm tra xem user có phải là consultant không
export function isConsultant(user: any): boolean {
  return user?.role === "consultant";
}

// Type guard để kiểm tra xem user đã xác thực email chưa
export function isEmailVerified(user: any): boolean {
  return user?.emailVerified === true;
}

// Kiểm tra xem token đã hết hạn chưa
export function isTokenExpired(token: string): boolean {
  try {
    const [, payload] = token.split(".");
    const { exp } = JSON.parse(atob(payload));
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}

// Lưu token vào localStorage
export function setAuthToken(token: string): void {
  localStorage.setItem("auth-token", token);
}

// Lấy token từ localStorage
export function getAuthToken(): string | null {
  return localStorage.getItem("auth-token");
}

// Xóa token khỏi localStorage
export function removeAuthToken(): void {
  localStorage.removeItem("auth-token");
}

export async function forgotPassword(email: string) {
  return AuthService.forgotPassword(email);
}

export async function resetPassword(token: string, password: string) {
  return AuthService.resetPassword({ token, password });
}
