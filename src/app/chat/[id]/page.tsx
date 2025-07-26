"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ChatRoom from "../../../components/ChatRoom";
import { useAuth } from "@/contexts/AuthContext";
import { AppointmentService, Appointment } from "@/services/appointment.service";
import { Loader2 } from "lucide-react";

function ChatRoomErrorBoundary({ children }: { children: React.ReactNode }) {
  try {
    return <>{children}</>;
  } catch (error) {
    console.error("[ChatRoomErrorBoundary] Error:", error);
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Đã xảy ra lỗi</h1>
        <p className="text-red-600">
          Không thể tải phòng chat. Vui lòng thử lại sau.
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

export default function ChatRoomPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoadingAppointment, setIsLoadingAppointment] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const appointmentId = params.id;

  useEffect(() => {
    const fetchAppointmentAndAuthorize = async () => {
      if (!isAuthenticated || !user) {
        // If not authenticated, redirect to login after auth loading is complete
        if (!isAuthLoading) {
          router.push("/auth/login");
        }
        return;
      }

      setIsLoadingAppointment(true);
      try {
        const fetchedAppointment = await AppointmentService.getAppointmentById(appointmentId);
        setAppointment(fetchedAppointment);

        if (!fetchedAppointment) {
          router.push("/404"); // Appointment not found
          return;
        }

        // Check authorization
        const currentUserIsCustomer = fetchedAppointment.userId === user.id;
        const currentUserIsConsultant = fetchedAppointment.consultantId === user.id;

        if (currentUserIsCustomer || currentUserIsConsultant) {
          setIsAuthorized(true);
        } else {
          // Not authorized, redirect to a forbidden page or home
          router.push("/403"); // Or any other appropriate page
        }
      } catch (error) {
        console.error("Error fetching appointment or authorizing user:", error);
        router.push("/404"); // Appointment not found or other error
      } finally {
        setIsLoadingAppointment(false);
      }
    };

    if (!isAuthLoading) { // Only fetch if authentication state is resolved
      fetchAppointmentAndAuthorize();
    }
  }, [appointmentId, user, isAuthenticated, isAuthLoading, router]);

  if (isAuthLoading || isLoadingAppointment) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Đang tải phòng chat...</p>
      </div>
    );
  }

  if (!isAuthorized || !appointment) {
    // This case should be handled by redirects in useEffect, but as a fallback
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Truy cập bị từ chối</h1>
        <p className="text-muted-foreground">
          Bạn không có quyền truy cập vào phòng chat này hoặc lịch hẹn không tồn tại.
        </p>
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64">Đang tải phòng chat...</div>}>
      <ChatRoomErrorBoundary>
        <ChatRoom appointmentId={appointmentId} />
      </ChatRoomErrorBoundary>
    </Suspense>
  );
}
