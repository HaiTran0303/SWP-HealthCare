"use client";

import UserAppointmentManagement from "@/components/UserAppointmentManagement";
import { Suspense } from "react";

function AppointmentErrorBoundary({ children }: { children: React.ReactNode }) {
  try {
    return <>{children}</>;
  } catch (error) {
    console.error("[AppointmentErrorBoundary] Error:", error);
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Đã xảy ra lỗi</h1>
        <p className="text-red-600">
          Không thể tải trang lịch hẹn. Vui lòng thử lại sau.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Tải lại trang
        </button>
      </div>
    );
  }
}

export default function MyAppointmentsPage() {
  console.log("[MyAppointmentsPage] Rendering appointments page");
  
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64">Đang tải...</div>}>
      <AppointmentErrorBoundary>
        <UserAppointmentManagement />
      </AppointmentErrorBoundary>
    </Suspense>
  );
}
