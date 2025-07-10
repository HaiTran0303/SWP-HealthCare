"use client";
import { useSearchParams } from "next/navigation";

export default function PaymentCancelPage() {
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");

  return (
    <div className="text-center py-10 text-red-500">
      Thanh toán đã bị huỷ.
      <br />
      {appointmentId && (
        <div className="mt-4">
          <a
            href={`/appointments/payment/${appointmentId}`}
            className="underline text-blue-600"
          >
            Thử thanh toán lại
          </a>
        </div>
      )}
    </div>
  );
}
