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
    
    console.log("[AuthContext] Initializing...");
    
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      console.log("[AuthContext] Found access token, setting headers");
      apiClient.setDefaultHeaders({
        Authorization: `Bearer ${accessToken}`,
      });
      // Try to check auth with existing token
      checkAuth();
    } else {
      setIsLoading(false);
      setIsAuthReady(true);
      console.log("[AuthContext] No access token found, not authenticated.");
    }
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
      console.log("[AuthContext] Checking auth...");
      const userData = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
      console.log("[AuthContext] Auth successful:", userData);
      setUser(userData);
      // Set cookie với token thật
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        document.cookie = `auth-token=${accessToken}; path=/; max-age=86400`;
      }
    } catch (error: any) {
      console.log("[AuthContext] Auth failed:", error);
      // If unauthorized, try to refresh token or clear auth
      if (error.status === 401) {
        try {
          console.log("[AuthContext] Trying to refresh token...");
          await refreshToken();
          const userData = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
          console.log("[AuthContext] Auth successful after refresh:", userData);
          setUser(userData);
          const accessToken = localStorage.getItem("accessToken");
          if (accessToken) {
            document.cookie = `auth-token=${accessToken}; path=/; max-age=86400`;
          }
        } catch (refreshError) {
          console.error("[AuthContext] Refresh failed:", refreshError);
          logoutUser(); // Clear user data and tokens
        }
      } else {
        console.error("[AuthContext] Other auth error:", error);
        logoutUser(); // Clear user data and tokens for other errors
      }
    } finally {
      setIsLoading(false);
      setIsAuthReady(true);
      console.log("[AuthContext] Auth ready");
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log("[AuthContext] Attempting login...");
      const response = await apiClient.post<any>(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      });
      const data = response;
      if (data && data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        document.cookie = `auth-token=${data.accessToken}; path=/; max-age=86400`;
        apiClient.setDefaultHeaders({
          Authorization: `Bearer ${data.accessToken}`,
        });
        // Lấy lại user đầy đủ từ backend
        const freshUser = await apiClient.get<User>("/users/me");
        setUser(freshUser);
        localStorage.setItem("userId", freshUser.id);
        console.log("[AuthContext] Login successful:", freshUser);
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
      console.error("[AuthContext] Login error:", error);
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
      console.log("[AuthContext] Attempting registration...");
      await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      toast({
        title: "Đăng ký thành công",
        description: "Vui lòng kiểm tra email để xác thực tài khoản",
      });
      router.push("/auth/verify-email");
    } catch (error) {
      console.error("[AuthContext] Registration error:", error);
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Có lỗi xảy ra",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logoutUser = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;"; // Clear auth-token cookie
    apiClient.removeDefaultHeader("Authorization");
    setUser(null);
    router.push("/");
  }, [router]);

  const logout = async () => {
    try {
      console.log("[AuthContext] Logging out...");
      logoutUser();
      toast({
        title: "Đăng xuất thành công",
        description: "Hẹn gặp lại bạn!",
      });
    } catch (error) {
      console.error("[AuthContext] Logout error:", error);
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
