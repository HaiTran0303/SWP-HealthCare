"use client";
import { useSearchParams } from "next/navigation";

export default function ResetErrorPage() {
  const searchParams = useSearchParams();
  const message =
    searchParams.get("message") || "Token không hợp lệ hoặc đã hết hạn.";

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-red-600">
        Lỗi đặt lại mật khẩu
      </h2>
      <div>{message}</div>
    </div>
  );
}
