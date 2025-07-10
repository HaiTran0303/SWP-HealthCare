"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { apiClient } from "@/services/api";
import { API_ENDPOINTS } from "@/config/api";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  role:
    | string
    | { id: string; name: string; description?: string; [key: string]: any };
  profilePicture?: string;
  phone?: string;
  address?: string;
  gender?: "M" | "F" | "O" | string;
}

interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface ApiError {
  status: number;
  message: string;
  data?: any;
}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  gender: "M" | "F" | "O";
  phone: string;
  address: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setAccessToken: (accessToken: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      apiClient.setDefaultHeaders({
        Authorization: `Bearer ${accessToken}`,
      });
    }
    checkAuth();
  }, []);

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) throw new Error("No refresh token");
      const response = await apiClient.post<RefreshTokenResponse>(
        API_ENDPOINTS.AUTH.REFRESH_TOKEN,
        { refreshToken }
      );
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      // Cập nhật authorization header
      apiClient.setDefaultHeaders({
        Authorization: `Bearer ${response.accessToken}`,
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const checkAuth = async () => {
    try {
      const userData = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
      setUser(userData);
    } catch (error) {
      if ((error as ApiError).status === 401) {
        try {
          await refreshToken();
          const userData = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
          setUser(userData);
        } catch (refreshError) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
      setIsAuthReady(true);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post<any>(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      });
      const data = response;
      if (data && data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        document.cookie = `auth-token=${data.accessToken}; path=/;`;
        apiClient.setDefaultHeaders({
          Authorization: `Bearer ${data.accessToken}`,
        });
        // Lấy lại user đầy đủ từ backend
        const freshUser = await apiClient.get<User>("/users/me");
        setUser(freshUser);
        localStorage.setItem("userId", freshUser.id);
      } else {
        throw new Error(
          "Đăng nhập thất bại: Không tìm thấy accessToken trong response"
        );
      }
      toast({
        title: "Đăng nhập thành công",
        description: "Chào mừng bạn quay trở lại!",
      });
      // Redirect based on user role
      if (data && data.user && data.user.role === "admin") {
        router.push("/admin");
      } else if (data && data.user && data.user.role === "consultant") {
        router.push("/consultant");
      } else {
        router.push("/");
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Có lỗi xảy ra",
        variant: "destructive",
      });
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      toast({
        title: "Đăng ký thành công",
        description: "Vui lòng kiểm tra email để xác thực tài khoản",
      });
      router.push("/auth/verify-email");
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Có lỗi xảy ra",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userId");
      setUser(null);

      apiClient.removeDefaultHeader("Authorization");
      document.cookie =
        "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      router.push("/");

      toast({
        title: "Đăng xuất thành công",
        description: "Hẹn gặp lại bạn!",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Có lỗi xảy ra",
        variant: "destructive",
      });
    }
  };

  const setAccessToken = (accessToken: string) => {
    localStorage.setItem("accessToken", accessToken);
    apiClient.setDefaultHeaders({
      Authorization: `Bearer ${accessToken}`,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isLoading,
        isAuthenticated: !!user,
        setUser,
        setAccessToken,
      }}
    >
      {isAuthReady ? children : null}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
