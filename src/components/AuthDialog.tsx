"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox"; // Import Checkbox
import { useAuth } from "@/contexts/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import { apiClient } from "@/services/api";
import { CredentialResponse } from "@react-oauth/google";
import { User, RegisterDto } from "@/contexts/AuthContext";
import Link from "next/link";
import { forgotPassword } from "@/services/auth.service";

interface AuthDialogProps {
  trigger: React.ReactNode;
  defaultTab?: "signin" | "register";
}

export default function AuthDialog({
  trigger,
  defaultTab = "signin",
}: AuthDialogProps) {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { login, register, setUser, setAccessToken } = useAuth();
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [passwordError, setPasswordError] = useState(""); // State for password validation error
  const [selectedGender, setSelectedGender] = useState<"M" | "F" | "O" | undefined>(undefined); // State for selected gender

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      await login(email, password);

      setOpen(false);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Có lỗi xảy ra",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Password validation function
  const validatePassword = (password: string): string => {
    if (password.length < 8) {
      return "Mật khẩu phải có ít nhất 8 ký tự.";
    }
    if (!/[A-Z]/.test(password)) {
      return "Mật khẩu phải chứa ít nhất một chữ cái viết hoa.";
    }
    if (!/[a-z]/.test(password)) {
      return "Mật khẩu phải chứa ít nhất một chữ cái viết thường.";
    }
    if (!/[0-9]/.test(password)) {
      return "Mật khẩu phải chứa ít nhất một chữ số.";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return "Mật khẩu phải chứa ít nhất một ký tự đặc biệt.";
    }
    return ""; // No error
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setPasswordError(""); // Clear previous password error

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;

    const validationMessage = validatePassword(password);
    if (validationMessage) {
      setPasswordError(validationMessage);
      setIsLoading(false);
      return;
    }

    try {
      const data: RegisterDto = {
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        email: formData.get("email") as string,
        password: password, // Use the validated password
        phone: formData.get("phone") as string,
        address: formData.get("address") as string,
        gender: formData.get("gender") as "M" | "F" | "O",
      };

      await register(data);

      toast({
        title: "Đăng ký thành công",
        description: "Vui lòng kiểm tra email để xác thực tài khoản",
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Có lỗi xảy ra",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = useCallback(
    async (credentialResponse: CredentialResponse) => {
      if (credentialResponse.credential) {
        try {
          const res = await apiClient.post<{ accessToken: string }>(
            "/auth/google/authenticate",
            {
              token: credentialResponse.credential,
            }
          );
          if (res?.accessToken) {
            setAccessToken(res.accessToken);
            localStorage.setItem("accessToken", res.accessToken);
            const user = await apiClient.get<any>("/auth/me");
            setUser(user as User);
            setOpen(false);
            toast({
              title: "Đăng nhập Google thành công",
              description: "Chào mừng bạn quay trở lại!",
            });
          } else {
            toast({
              title: "Lỗi",
              description: "Không nhận được accessToken từ server",
              variant: "destructive",
            });
          }
        } catch (error) {
          toast({
            title: "Lỗi",
            description:
              error instanceof Error ? error.message : "Có lỗi xảy ra",
            variant: "destructive",
          });
        }
      }
    },
    [setAccessToken, setUser, toast]
  );

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    try {
      await forgotPassword(forgotEmail);
      setForgotSent(true);
    } catch (err: any) {
      setForgotError(err?.response?.data?.message || "Có lỗi xảy ra!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-background">
        <DialogHeader>
          <DialogTitle>
            Chào mừng đến với Trung tâm chăm sóc sức khỏe giới tính
          </DialogTitle>
          <DialogDescription>
            Đăng nhập hoặc tạo tài khoản mới để sử dụng dịch vụ
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Đăng nhập</TabsTrigger>
            <TabsTrigger value="register">Đăng ký</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4">
            {!forgotMode ? (
              <>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="Nhập email của bạn"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Mật khẩu</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Nhập mật khẩu"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                  </Button>
                  <div className="text-center">
                    <button
                      type="button"
                      className="text-sm text-blue-600 hover:underline"
                      onClick={() => setForgotMode(true)}
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => {}}
                  />
                </form>
              </>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="text-center font-bold text-lg mb-2">
                  Quên mật khẩu
                </div>
                {forgotSent ? (
                  <div className="text-green-600">
                    Vui lòng kiểm tra email để đặt lại mật khẩu.
                  </div>
                ) : (
                  <>
                    <input
                      type="email"
                      className="input input-bordered w-full"
                      placeholder="Nhập email của bạn"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                    />
                    <Button type="submit" className="w-full">
                      Gửi yêu cầu
                    </Button>
                    {forgotError && (
                      <div className="text-red-500">{forgotError}</div>
                    )}
                  </>
                )}
                <div className="text-center mt-2">
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:underline"
                    onClick={() => {
                      setForgotMode(false);
                      setForgotSent(false);
                      setForgotEmail("");
                      setForgotError("");
                    }}
                  >
                    Quay lại đăng nhập
                  </button>
                </div>
              </form>
            )}
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="register-firstname">Họ</Label>
                  <Input
                    id="register-firstname"
                    name="firstName"
                    placeholder="Họ"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-lastname">Tên</Label>
                  <Input
                    id="register-lastname"
                    name="lastName"
                    placeholder="Tên"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  name="email"
                  type="email"
                  placeholder="Nhập email của bạn"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Mật khẩu</Label>
                <div className="relative">
                  <Input
                    id="register-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Tạo mật khẩu"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {passwordError && (
                <p className="text-red-500 text-sm">{passwordError}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-phone">Số điện thoại</Label>
              <Input
                id="register-phone"
                name="phone"
                type="tel"
                placeholder="Nhập số điện thoại"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-address">Địa chỉ</Label>
              <Input
                id="register-address"
                name="address"
                placeholder="Nhập địa chỉ"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-gender">Giới tính</Label>
              <Select name="gender" required onValueChange={(value: "M" | "F" | "O") => setSelectedGender(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn giới tính" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Nam</SelectItem>
                  <SelectItem value="F">Nữ</SelectItem>
                  <SelectItem value="O">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Bằng cách tạo tài khoản, bạn đồng ý với Điều khoản dịch vụ và
              Chính sách bảo mật của chúng tôi.
            </p>
          </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
