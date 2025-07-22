"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StiTestingPaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Optionally, you can add logic here to verify the payment status with your backend
    // using the query parameters from the URL if needed.
  }, []);

  const handleGoToAppointments = () => {
    router.push("/profile/appointments");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <CheckCircle className="mx-auto h-24 w-24 text-green-500" />
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Thanh toán thành công!
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Giao dịch của bạn đã được xử lý thành công.
          <br />
          Bạn có thể xem chi tiết lịch hẹn của mình.
        </p>
        <div className="mt-6">
          <Button
            onClick={handleGoToAppointments}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Xem lịch hẹn của tôi
          </Button>
        </div>
      </div>
    </div>
  );
}
