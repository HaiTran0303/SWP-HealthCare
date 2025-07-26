"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ConsultantProfile } from "@/services/consultant.service";
import { AppointmentService, CreateAppointmentRequest } from "@/services/appointment.service";
import { format } from "date-fns"; // Import format from date-fns

interface BookingFormData {
  consultationReason: string;
  symptoms: string;
  additionalNotes: string;
  preferredContactMethod: "video" | "phone" | "chat";
}

interface ValidationErrors {
  consultationReason?: string;
  symptoms?: string;
  additionalNotes?: string;
  general?: string;
}

export function useConsultationBooking() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateForm = (data: BookingFormData): ValidationErrors => {
    const newErrors: ValidationErrors = {};

    // Validate consultation reason
    if (!data.consultationReason.trim()) {
      newErrors.consultationReason = "Vui lòng nhập lý do tư vấn";
    } else if (data.consultationReason.trim().length < 10) {
      newErrors.consultationReason = "Lý do tư vấn phải có ít nhất 10 ký tự";
    } else if (data.consultationReason.trim().length > 500) {
      newErrors.consultationReason = "Lý do tư vấn không được quá 500 ký tự";
    }

    // Validate symptoms (optional but if provided, check length)
    if (data.symptoms.trim() && data.symptoms.trim().length > 500) {
      newErrors.symptoms = "Mô tả triệu chứng không được quá 500 ký tự";
    }

    // Validate additional notes (optional but if provided, check length)
    if (data.additionalNotes.trim() && data.additionalNotes.trim().length > 300) {
      newErrors.additionalNotes = "Ghi chú không được quá 300 ký tự";
    }

    return newErrors;
  };

  const bookAppointment = async (
    consultant: ConsultantProfile,
    selectedDate: Date,
    selectedTime: string,
    formData: BookingFormData,
    serviceId: string | undefined, // Removed appointmentLocation parameter
    meetingLink?: string // Make meetingLink optional
  ) => {
    setIsLoading(true);
    setErrors({});

    try {
      // Validate form data
      const validationErrors = validateForm(formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        toast({
          title: "Thông tin chưa hợp lệ",
          description: "Vui lòng kiểm tra lại thông tin đã nhập",
          variant: "destructive",
        });
        return false;
      }

      // Combine selectedDate and selectedTime into a single Date object in local timezone
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const finalAppointmentDateTime = new Date(selectedDate.setHours(hours, minutes, 0, 0));

      // Format to ISO 8601 string in UTC, as required by the backend API
      const formattedAppointmentDate = finalAppointmentDateTime.toISOString();

      console.log("selectedDate (original):", selectedDate);
      console.log("selectedTime:", selectedTime);
      console.log("finalAppointmentDateTime (Date object, local timezone):", finalAppointmentDateTime);
      console.log("formattedAppointmentDate (ISO UTC):", formattedAppointmentDate);

      // Check if combined date and time is in the past
      if (finalAppointmentDateTime < new Date()) {
        setErrors({ general: "Không thể đặt lịch cho thời gian trong quá khứ" });
        toast({
          title: "Thời gian không hợp lệ",
          description: "Vui lòng chọn thời gian trong tương lai",
          variant: "destructive",
        });
        return false;
      }

      // Prepare appointment data
      const appointmentData: CreateAppointmentRequest = {
        consultantId: consultant.user.id, // Use the nested user ID
        appointmentDate: formattedAppointmentDate, // Use the locally formatted date and time
        notes: buildNotesString(formData),
        serviceIds: serviceId ? [serviceId] : [], // Convert single serviceId to an array if it exists
        meetingLink: meetingLink, // Pass meetingLink if provided, otherwise it will be undefined
        appointmentLocation: "online", // Always set to "online" as per user feedback
      };

      console.log("[useConsultationBooking] Final appointmentData:", appointmentData); // Log the final data

      // Create appointment
      const createdAppointment = await AppointmentService.createAppointment(appointmentData);
      
      toast({
        title: "Đặt lịch thành công!",
        description: "Lịch tư vấn của bạn đang chờ thanh toán. Vui lòng hoàn tất thanh toán để xác nhận.",
      });

      // Redirect to the payment page for the newly created appointment
      // Assuming a payment page exists at /appointments/payment/[id]
      window.location.href = `/appointments/payment/${createdAppointment.id}`;

      return true;
    } catch (error: any) {
      console.error("Error booking appointment:", error);

      let errorMessage = "Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại.";
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
        console.error("API Error Response Data:", error.response.data);
      }
      
      if (error.status === 400) {
        errorMessage = errorMessage || "Thông tin đặt lịch không hợp lệ";
      } else if (error.status === 401) {
        errorMessage = errorMessage || "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
      } else if (error.status === 403) {
        errorMessage = errorMessage || "Bạn không có quyền thực hiện hành động này";
      } else if (error.status === 409) {
        errorMessage = errorMessage || "Khung giờ này đã được đặt. Vui lòng chọn khung giờ khác.";
      } else if (error.status === 422) {
        errorMessage = errorMessage || "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.";
      }
      
      setErrors({ general: errorMessage });
      toast({
        title: "Đặt lịch thất bại",
        description: errorMessage,
        variant: "destructive",
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const buildNotesString = (formData: BookingFormData): string => {
    const parts: string[] = [];

    parts.push(`Lý do tư vấn: ${formData.consultationReason}`);

    if (formData.symptoms.trim()) {
      parts.push(`Triệu chứng: ${formData.symptoms}`);
    }

    if (formData.additionalNotes.trim()) {
      parts.push(`Ghi chú: ${formData.additionalNotes}`);
    }

    parts.push(`Phương thức liên hệ mong muốn: ${
      formData.preferredContactMethod === "video" ? "Video call" :
      formData.preferredContactMethod === "phone" ? "Điện thoại" : "Chat"
    }`);

    return parts.join("\n\n");
  };

  const clearErrors = () => {
    setErrors({});
  };

  const getFieldError = (fieldName: keyof ValidationErrors): string | undefined => {
    return errors[fieldName];
  };

  return {
    bookAppointment,
    validateForm,
    clearErrors,
    getFieldError,
    isLoading,
    errors,
  };
}
