"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function PackagePaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Đang xử lý thanh toán gói dịch vụ thành công...");

  useEffect(() => {
    const orderCode = searchParams.get("orderCode"); // Assuming PayOS returns orderCode in query params

    if (orderCode) {
      setMessage(`Thanh toán gói dịch vụ thành công! Mã đơn hàng: ${orderCode}`);
      toast({
        title: "Thanh toán gói dịch vụ thành công!",
        description: `Mã đơn hàng: ${orderCode}`,
        variant: "default",
      });
    } else {
      setMessage("Không tìm thấy thông tin thanh toán gói dịch vụ.");
      toast({
        title: "Lỗi thanh toán gói dịch vụ",
        description: "Không tìm thấy thông tin thanh toán gói dịch vụ.",
        variant: "destructive",
      });
    }
    setLoading(false);
  }, [searchParams, toast]);

  const handleGoToMyPackages = () => {
    router.push("/profile/my-packages"); // Assuming a route for user's packages
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-10">
      <h1 className="text-2xl font-bold mb-4">Trạng thái thanh toán gói dịch vụ</h1>
      <p className="text-lg mb-6">{message}</p>
      {!loading && (
        <Button onClick={handleGoToMyPackages}>
          Xem gói dịch vụ của tôi
        </Button>
      )}
    </div>
  );
}
