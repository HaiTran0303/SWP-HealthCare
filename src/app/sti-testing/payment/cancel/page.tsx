"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StiTestingPaymentCancelPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stiTestProcessId = searchParams.get("stiTestProcessId");

  useEffect(() => {
    // Optionally, you can add logic here to update the appointment status to cancelled
    // or log the cancellation reason if needed.
    if (stiTestProcessId) {
      console.log(`STI Test Process ID ${stiTestProcessId} payment was cancelled.`);
    }
  }, [stiTestProcessId]);

  const handleGoToAppointments = () => {
    router.push("/profile/appointments");
  };

  const handleTryAgain = () => {
    if (stiTestProcessId) {
      router.push(`/sti-testing/payment/${stiTestProcessId}`);
    } else {
      router.push("/consultant"); // Fallback to booking page if ID is missing
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <XCircle className="mx-auto h-24 w-24 text-red-500" />
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Thanh toán đã bị hủy hoặc không thành công.
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Giao dịch của bạn đã không được hoàn tất.
          <br />
          Vui lòng thử lại hoặc liên hệ hỗ trợ nếu bạn gặp sự cố.
        </p>
        <div className="mt-6 space-y-4">
          <Button
            onClick={handleTryAgain}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Thử lại
          </Button>
          <Button
            onClick={handleGoToAppointments}
            variant="outline"
            className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Xem lịch hẹn của tôi
          </Button>
        </div>
      </div>
    </div>
  );
}
