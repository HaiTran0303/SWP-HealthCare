"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    const user = searchParams.get("user");

    if (accessToken && refreshToken && user) {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      // Có thể cần parse user nếu backend trả về JSON string
      // login(user); // hoặc setUser(user)
      router.push("/");
    } else {
      router.push("/auth/login?error=google");
    }
  }, [searchParams, login, router]);

  return <div>Đang đăng nhập với Google...</div>;
}
