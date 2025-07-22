"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Đang xử lý thanh toán thành công...");

  useEffect(() => {
    const orderCode = searchParams.get("orderCode"); // Assuming PayOS returns orderCode in query params

    if (orderCode) {
      // Here you would typically call your backend to verify the payment status
      // For now, we'll just display a success message.
      setMessage(`Thanh toán thành công! Mã đơn hàng: ${orderCode}`);
      toast({
        title: "Thanh toán thành công!",
        description: `Mã đơn hàng: ${orderCode}`,
        variant: "default",
      });
    } else {
      setMessage("Không tìm thấy thông tin thanh toán.");
      toast({
        title: "Lỗi thanh toán",
        description: "Không tìm thấy thông tin thanh toán.",
        variant: "destructive",
      });
    }
    setLoading(false);
  }, [searchParams, toast]);

  const handleGoToAppointments = () => {
    router.push("/profile/appointments"); // Redirect to user's appointments page
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-10">
      <h1 className="text-2xl font-bold mb-4">Trạng thái thanh toán</h1>
      <p className="text-lg mb-6">{message}</p>
      {!loading && (
        <Button onClick={handleGoToAppointments}>
          Xem lịch hẹn của tôi
        </Button>
      )}
    </div>
  );
}
