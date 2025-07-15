"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AuthDialog from "@/components/AuthDialog";
import { useState } from "react";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false); // Added this line

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
      // Show AuthDialog on error
      setShowAuthDialog(true);
    }
  }, [searchParams, login, router]);

  return (
    <>
      <div>Đang đăng nhập với Google...</div>
      {showAuthDialog && (
        <AuthDialog trigger={<span className="sr-only"></span>} defaultTab="signin" />
      )}
    </>
  );
}
