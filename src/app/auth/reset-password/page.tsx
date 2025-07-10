"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/services/auth.service";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  if (!token) {
    if (typeof window !== "undefined")
      router.replace("/auth/reset-error?message=Token không hợp lệ");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => router.push("/"), 2000);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Có lỗi xảy ra!");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Đặt lại mật khẩu</h2>
      {success ? (
        <div className="text-green-600">
          Đặt lại mật khẩu thành công! Đang chuyển hướng...
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Nhập mật khẩu mới"
            className="input input-bordered w-full mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="btn btn-primary w-full" type="submit">
            Đặt lại mật khẩu
          </button>
          {error && <div className="text-red-500 mt-2">{error}</div>}
        </form>
      )}
    </div>
  );
}
