"use client";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function ServicePaymentCancelPage() {
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("serviceId");
  const router = useRouter();

  const handleRetryPayment = () => {
    if (serviceId) {
      router.push(`/services/payment/${serviceId}`);
    } else {
      router.push("/"); // Fallback to home or a generic services page
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-10 text-red-500">
      <h1 className="text-2xl font-bold mb-4">Thanh toán dịch vụ đã bị huỷ.</h1>
      <p className="text-lg mb-6">Vui lòng thử lại nếu có lỗi xảy ra.</p>
      {serviceId && (
        <Button onClick={handleRetryPayment}>
          Thử thanh toán lại dịch vụ
        </Button>
      )}
    </div>
  );
}
