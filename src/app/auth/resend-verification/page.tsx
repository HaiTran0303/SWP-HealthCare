"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Mail } from "lucide-react";
import { AuthService } from "@/services/auth.service";

export default function ResendVerificationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await AuthService.resendVerificationEmail(email);
      toast({
        title: "Gửi email thành công",
        description: "Vui lòng kiểm tra email để xác thực tài khoản",
      });
      router.push("/");
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

  return (
    <div className="container flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center space-y-4 text-center">
          <Mail className="w-16 h-16 text-primary" />
          <h1 className="text-2xl font-bold">Gửi lại email xác thực</h1>
          <p className="text-muted-foreground">
            Nhập email của bạn để nhận lại link xác thực
          </p>
          <form
            onSubmit={handleResendVerification}
            className="w-full space-y-4"
          >
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="flex flex-col space-y-2">
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Đang gửi..." : "Gửi lại email xác thực"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/")}
                className="w-full"
              >
                Về trang chủ
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
