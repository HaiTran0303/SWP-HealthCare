"use client";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

function VerifySuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  return (
    <div className="container flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center space-y-4 text-center">
          <CheckCircle2 className="w-16 h-16 text-success" />
          <h1 className="text-2xl font-bold">Xác thực email thành công</h1>
          <p className="text-muted-foreground">
            {decodeURIComponent(
              message || "Email của bạn đã được xác thực thành công"
            )}
          </p>
          <div className="flex flex-col space-y-2 w-full">
            <Button
              className="w-full"
              onClick={() => router.push("/auth/login")}
            >
              Đăng nhập ngay
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/")}
            >
              Về trang chủ
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function VerifySuccessPage() {
  return (
    <Suspense>
      <VerifySuccessContent />
    </Suspense>
  );
}
