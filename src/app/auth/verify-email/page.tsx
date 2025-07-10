"use client";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const isError =
    typeof window !== "undefined" &&
    window.location.pathname.includes("verify-error");

  return (
    <div className="container flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center space-y-4 text-center">
          {isError ? (
            <XCircle className="w-16 h-16 text-destructive" />
          ) : (
            <CheckCircle2 className="w-16 h-16 text-success" />
          )}
          <h1 className="text-2xl font-bold">
            {isError ? "Xác thực email thất bại" : "Xác thực email thành công"}
          </h1>
          <p className="text-muted-foreground">
            {decodeURIComponent(message || "")}
          </p>
          <div className="flex flex-col space-y-2">
            <Button onClick={() => router.push("/auth/login")}>
              Đăng nhập ngay
            </Button>
            <Button variant="outline" onClick={() => router.push("/")}>
              Về trang chủ
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
