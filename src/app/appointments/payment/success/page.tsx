"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { PaymentService } from "@/services/payment.service";
import { Appointment } from "@/types/api.d";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Đang xử lý thanh toán thành công...");
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);

  useEffect(() => {
    const orderCode = searchParams.get("orderCode");
    const appointmentId = searchParams.get("appointmentId"); // Assuming appointmentId is passed

    const handlePaymentVerification = async () => {
      if (!orderCode || !appointmentId) {
        setMessage("Không tìm thấy thông tin thanh toán hoặc ID cuộc hẹn.");
        toast({
          title: "Lỗi thanh toán",
          description: "Thiếu thông tin cần thiết để xác minh thanh toán.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      try {
        setMessage("Đang xác minh thanh toán...");
        const updatedAppointment: Appointment = await PaymentService.verifyPayment(orderCode, appointmentId);

        if (updatedAppointment.paymentStatus === "completed" && updatedAppointment.status === "confirmed") {
          setMessage(`Thanh toán thành công! Mã đơn hàng: ${orderCode}. Lịch hẹn đã được xác nhận.`);
          toast({
            title: "Thanh toán thành công!",
            description: `Mã đơn hàng: ${orderCode}. Lịch hẹn đã được xác nhận.`,
            variant: "default",
          });
          setChatRoomId(updatedAppointment.chatRoomId || null);
          setIsPaymentConfirmed(true);
        } else {
          setMessage("Thanh toán không thành công hoặc trạng thái lịch hẹn chưa được cập nhật.");
          toast({
            title: "Lỗi xác minh thanh toán",
            description: "Vui lòng kiểm tra lại trạng thái lịch hẹn của bạn.",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error("Error verifying payment:", error);
        setMessage(`Lỗi khi xác minh thanh toán: ${error.message || "Đã xảy ra lỗi không xác định."}`);
        toast({
          title: "Lỗi xác minh thanh toán",
          description: error.message || "Đã xảy ra lỗi không xác định.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    handlePaymentVerification();
  }, [searchParams, toast]);

  const handleGoToChat = () => {
    if (chatRoomId) {
      router.push(`/chat/${chatRoomId}`);
    } else {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy phòng chat. Vui lòng kiểm tra lại lịch hẹn của bạn.",
        variant: "destructive",
      });
    }
  };

  const handleGoToAppointments = () => {
    router.push("/profile/appointments");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-10">
      <h1 className="text-2xl font-bold mb-4">Trạng thái thanh toán</h1>
      <p className="text-lg mb-6 text-center">{message}</p>
      {!loading && (
        <div className="flex flex-col gap-4">
          {isPaymentConfirmed && chatRoomId ? (
            <Button onClick={handleGoToChat}>
              Vào phòng chat
            </Button>
          ) : (
            <Button onClick={handleGoToAppointments}>
              Xem lịch hẹn của tôi
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
