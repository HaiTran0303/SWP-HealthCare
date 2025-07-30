"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // Import useSearchParams
import ChatRoom from "../../../components/ChatRoom";
import { useAuth } from "@/contexts/AuthContext";
import { ChatService } from "@/services/chat.service"; // Import ChatService
import { AppointmentService } from "@/services/appointment.service"; // Import AppointmentService
import { Question } from "@/types/api.d"; // Import Question type
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
  const searchParams = useSearchParams(); // Initialize useSearchParams
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [chatQuestion, setChatQuestion] = useState<Question | null>(null); // Renamed from chatRoom to chatQuestion for clarity
  const [isLoadingChatRoom, setIsLoadingChatRoom] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const questionId = params.id;
  const initialTitle = searchParams.get("title");
  const initialContent = searchParams.get("content");
  const appointmentId = searchParams.get("appointmentId"); // Get appointmentId from query params
  console.log("[ChatRoomPage] Received questionId from params:", questionId);
  console.log("[ChatRoomPage] Received initialTitle from query:", initialTitle);
  console.log("[ChatRoomPage] Received initialContent from query:", initialContent);
  console.log("[ChatRoomPage] Received appointmentId from query:", appointmentId);

  useEffect(() => {
    const fetchChatDataAndAuthorize = async () => {
      if (!isAuthenticated || !user) {
        if (!isAuthLoading) {
          router.push("/auth/login");
        }
        return;
      }

      setIsLoadingChatRoom(true);
      let fetchedQuestion: Question | null = null;

      try {
        // Try to fetch Question by questionId first
        fetchedQuestion = await ChatService.getQuestionById(questionId);
        setChatQuestion(fetchedQuestion);
        console.log("[ChatRoomPage] Fetched Question by ID:", fetchedQuestion);
      } catch (questionError: any) {
        console.error("[ChatRoomPage] Error fetching question by ID:", questionError);
        // If fetching Question fails, try to construct a Question from query params
        if (initialTitle && initialContent) {
          fetchedQuestion = {
            id: questionId,
            title: decodeURIComponent(initialTitle),
            content: decodeURIComponent(initialContent),
            userId: user.id, // Assume current user is the creator if created via dialog
            status: "pending", // Default status for newly created chat
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            appointmentId: appointmentId || undefined, // Include appointmentId if present
          };
          setChatQuestion(fetchedQuestion);
          console.log("[ChatRoomPage] Constructed Question from query params:", fetchedQuestion);
        }
      } finally {
        if (!fetchedQuestion) {
          router.push("/404");
          setIsLoadingChatRoom(false);
          return;
        }

        // Authorization logic
        const currentUserIsCreator = fetchedQuestion.userId === user.id;
        let currentUserIsConsultant = false;

        // Check if the user is a consultant and is linked to this question's appointment
        if (user.role?.name === "consultant" && fetchedQuestion.appointmentId) {
          try {
            const appointment = await AppointmentService.getAppointmentById(fetchedQuestion.appointmentId);
            if (appointment && appointment.consultantId === user.id) {
              currentUserIsConsultant = true;
            }
          } catch (aptError) {
            console.error("[ChatRoomPage] Error fetching appointment for consultant authorization:", aptError);
          }
        }

        if (currentUserIsCreator || currentUserIsConsultant) {
          setIsAuthorized(true);
        } else {
          router.push("/403");
        }
        setIsLoadingChatRoom(false);
      }
    };

    if (!isAuthLoading) {
      fetchChatDataAndAuthorize();
    }
  }, [questionId, initialTitle, initialContent, appointmentId, user, isAuthenticated, isAuthLoading, router]);

  if (isAuthLoading || isLoadingChatRoom) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Đang tải phòng chat...</p>
      </div>
    );
  }

  if (!isAuthorized || !chatQuestion) {
    // This case should be handled by redirects in useEffect, but as a fallback
    // Also handle the "Khách hàng chưa có câu hỏi" message for consultants
    if (user?.role?.name === "consultant" && !chatQuestion) {
      return (
        <div className="container mx-auto p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Khách hàng chưa có câu hỏi</h1>
          <p className="text-muted-foreground">
            Phòng chat này chưa được khách hàng khởi tạo hoặc đã bị đóng.
          </p>
        </div>
      );
    }
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Truy cập bị từ chối</h1>
        <p className="text-muted-foreground">
          Bạn không có quyền truy cập vào phòng chat này hoặc phòng chat không tồn tại.
        </p>
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64">Đang tải phòng chat...</div>}>
      <ChatRoomErrorBoundary>
        <ChatRoom
          questionId={questionId}
          initialTitle={initialTitle || undefined}
          initialContent={initialContent || undefined}
        /> {/* Pass questionId and optional initialTitle/initialContent to ChatRoom */}
      </ChatRoomErrorBoundary>
    </Suspense>
  );
}
