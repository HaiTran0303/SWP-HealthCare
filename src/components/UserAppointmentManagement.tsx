"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  CalendarIcon,
  Clock,
  MapPin,
  Phone,
  Video,
  Star, // Keep Star for display
  StarIcon, // Use StarIcon for rating input
  User,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  Loader2,
  Ban,
  Eye,
  MessageSquare,
  CreditCard, // Add CreditCard icon
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { AppointmentService, AppointmentStatus, Appointment as GeneralAppointmentType } from "@/services/appointment.service";
import { ChatService } from "@/services/chat.service";
import { STITestingService, StiProcess as StiAppointmentType } from "@/services/sti-testing.service";
import { FeedbackService } from "@/services/feedback.service"; // Import FeedbackService
import { Feedback, CreateFeedbackDto } from "@/types/feedback"; // Import Feedback types
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DialogClose } from "@/components/ui/dialog";
import { Pagination } from "@/components/ui/pagination"; // Import Pagination components
import { PaginationInfo } from "@/components/ui/pagination-info"; // Import PaginationInfo
import { PaginationResponse } from "@/types/api.d"; // Import PaginationResponse

interface ConsultantDetails {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  specialties: string[];
  qualification?: string;
  experience?: string;
  rating?: number;
}

interface ServiceDetails {
  id: string;
  name: string;
  description?: string;
  price?: number;
  type?: string;
}

interface AppointmentDetails {
  id: string;
  consultantId?: string;
  consultant?: ConsultantDetails;
  appointmentDate: string;
  status: AppointmentStatus;
  notes?: string;
  meetingLink?: string;
  location: "online" | "office";
  createdAt: string;
  updatedAt: string;
  cancellationReason?: string;
  services?: ServiceDetails[];
  questionId?: string;
  type: "consultation" | "sti_test";
  sampleCollectionDate?: string;
  sampleCollectionLocation?: "online" | "office";
  stiServiceId?: string;
  testCode?: string;
  feedbackId?: string; // Add feedback ID
  feedback?: Feedback; // Add feedback object
}

interface CancelDialogProps {
  appointment: AppointmentDetails;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading: boolean;
}

interface RatingDialogProps {
  appointment: AppointmentDetails;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (rating: number, comment: string, isAnonymous: boolean) => void;
  isLoading: boolean;
}

const RatingDialog: React.FC<RatingDialogProps> = ({
  appointment,
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleConfirm = () => {
    if (rating > 0) {
      onConfirm(rating, comment, isAnonymous);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Đánh giá lịch hẹn</DialogTitle>
          <DialogDescription>
            Vui lòng chia sẻ trải nghiệm của bạn về lịch hẹn với {appointment.consultant?.firstName} {appointment.consultant?.lastName}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rating">Đánh giá sao:</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className={`w-8 h-8 cursor-pointer ${
                    star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                  }`}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="comment">Bình luận:</Label>
            <Textarea
              id="comment"
              placeholder="Chia sẻ thêm về trải nghiệm của bạn..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="anonymous">Gửi ẩn danh</Label>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading}>
              Đóng
            </Button>
          </DialogClose>
          <Button
            onClick={handleConfirm}
            disabled={rating === 0 || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang gửi...
              </>
            ) : (
              "Gửi phản hồi"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const CancelDialog: React.FC<CancelDialogProps> = ({
  appointment,
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}) => {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hủy lịch hẹn</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn hủy lịch hẹn với {appointment.consultant?.firstName} {appointment.consultant?.lastName}?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Lý do hủy</Label>
            <Textarea
              id="reason"
              placeholder="Vui lòng cho biết lý do hủy lịch hẹn..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Đóng
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!reason.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang hủy...
              </>
            ) : (
              "Xác nhận hủy"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const AppointmentCard: React.FC<{
  appointment: AppointmentDetails;
  onCancel: (appointment: AppointmentDetails) => void;
  onViewDetails: (appointment: AppointmentDetails) => void;
  onEnterChat: (appointment: AppointmentDetails) => void;
  onRateAppointment: (appointment: AppointmentDetails) => void;
  onPayAppointment: (appointment: AppointmentDetails) => void;
  getStatusIcon: (status: AppointmentStatus) => JSX.Element;
  getStatusColor: (status: AppointmentStatus) => string;
}> = ({ appointment, onCancel, onViewDetails, onEnterChat, onRateAppointment, onPayAppointment, getStatusIcon, getStatusColor }) => {

  const canCancel = AppointmentService.canCancel(appointment.status);
  const isPastAppointment = AppointmentService.isPastAppointment(appointment.appointmentDate);
  const isCompletedAndPast = appointment.status === "completed" && isPastAppointment;
  const hasFeedback = !!appointment.feedbackId;

  const appointmentDateObj = new Date(appointment.appointmentDate);
  const isDateValid = !isNaN(appointmentDateObj.getTime());

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={appointment.consultant?.profilePicture} alt={`${appointment.consultant?.firstName} ${appointment.consultant?.lastName}`} />
              <AvatarFallback>
                {`${appointment.consultant?.firstName?.[0] || ''}${appointment.consultant?.lastName?.[0] || ''}`}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">
                {appointment.consultant ? `${appointment.consultant.firstName} ${appointment.consultant.lastName}` : "N/A"}
              </h3>
              <p className="text-sm text-muted-foreground">{appointment.consultant?.qualification || "N/A"}</p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm">{appointment.consultant?.rating ? `${appointment.consultant.rating}/5` : "N/A"}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(appointment.status)}>
              {getStatusIcon(appointment.status)}
              <span className="ml-1">{AppointmentService.getStatusText(appointment.status)}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              {isDateValid ? format(appointmentDateObj, "EEEE, dd/MM/yyyy", { locale: vi }) : "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              {isDateValid ? format(appointmentDateObj, "HH:mm") : "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              {appointment.location === "online" ? "Tư vấn trực tuyến" : "Tại phòng khám"}
            </span>
          </div>
          {appointment.services && (
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                {appointment.services.map(s => s.name).join(", ")}
                {appointment.type === "sti_test" && appointment.testCode && ` (Mã: ${appointment.testCode})`}
              </span>
            </div>
          )}
        </div>

        {appointment.notes && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Ghi chú:</Label>
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg line-clamp-3">
              {appointment.notes}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(appointment)}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Chi tiết
          </Button>
          
          {canCancel && !isPastAppointment && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onCancel(appointment)}
              className="flex items-center gap-2"
            >
              <Ban className="w-4 h-4" />
              Hủy lịch
            </Button>
          )}
          
          {appointment.status === "confirmed" && appointment.meetingLink && (
            <Button
              variant="default"
              size="sm"
              onClick={() => window.open(appointment.meetingLink, "_blank")}
              className="flex items-center gap-2"
            >
              <Video className="w-4 h-4" />
              Tham gia
            </Button>
          )}
          
          {/* Add Chat Button */}
          {["confirmed", "in_progress", "completed"].includes(
            appointment.status
          ) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEnterChat(appointment)}
              className="flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Vào chat
            </Button>
          )}

          {isCompletedAndPast && !hasFeedback && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onRateAppointment(appointment)}
              className="flex items-center gap-2"
            >
              <StarIcon className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              Gửi phản hồi
            </Button>
          )}

          {isCompletedAndPast && hasFeedback && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(appointment)} // Re-use onViewDetails to show feedback in dialog
              className="flex items-center gap-2"
            >
              <StarIcon className="w-4 h-4" />
              Xem phản hồi
            </Button>
          )}

          {/* Add Pay Button */}
          {appointment.status === "pending" && (appointment.type === "consultation" || appointment.type === "sti_test") && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onPayAppointment(appointment)}
              className="flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Thanh toán
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const UserAppointmentManagement: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<AppointmentDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentDetails | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAppointmentsCount, setTotalAppointmentsCount] = useState(0); // Total count for all appointments
  const itemsPerPage = 10; // Number of items per page

  const getStatusIcon = (status: AppointmentStatus) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "no_show":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "no_show":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    if (!user) {
      console.log("User not logged in.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      console.log("Fetching appointments for user:", user.id);
      const [generalAppointmentsResponse, stiAppointmentsResponse] = await Promise.all([
        AppointmentService.getUserAppointments({ page: currentPage, limit: itemsPerPage }),
        STITestingService.getUserStiAppointments({ page: currentPage, limit: itemsPerPage }),
      ]) as [
          PaginationResponse<GeneralAppointmentType>,
          PaginationResponse<StiAppointmentType>
        ];

      console.log("Raw General Appointments Response:", generalAppointmentsResponse);
      console.log("Raw STI Appointments Response:", stiAppointmentsResponse);

      const generalAppointments: AppointmentDetails[] = await Promise.all(
        Array.isArray(generalAppointmentsResponse.data)
          ? generalAppointmentsResponse.data.map(async (apt: any) => {
            const appointmentDetails: AppointmentDetails = {
              id: apt.id,
              consultantId: apt.consultant?.id,
              consultant: apt.consultant ? {
                id: apt.consultant.id,
                firstName: apt.consultant.firstName || '',
                lastName: apt.consultant.lastName || '',
                profilePicture: apt.consultant.profilePicture || apt.consultant.avatar,
                specialties: apt.consultant.specialties || [],
                qualification: apt.consultant.qualification,
                experience: apt.consultant.experience,
                rating: apt.consultant.rating,
              } : undefined,
              appointmentDate: apt.appointmentDate,
              status: apt.status as AppointmentStatus,
              notes: apt.notes,
              meetingLink: apt.meetingLink,
              location: apt.location,
              createdAt: apt.createdAt,
              updatedAt: apt.updatedAt,
              cancellationReason: apt.cancellationReason,
              services: apt.services?.map((s: any) => ({
                id: s.id,
                name: s.name,
                description: s.description,
                price: s.price,
                type: s.type,
              })),
              questionId: apt.questionId,
              type: "consultation",
              feedbackId: apt.feedbackId,
              feedback: undefined,
            };

            if (appointmentDetails.feedbackId) {
              try {
                const feedbackResponse = await FeedbackService.getFeedbackById(appointmentDetails.feedbackId);
                appointmentDetails.feedback = feedbackResponse;
              } catch (feedbackError) {
                console.error(`Error fetching feedback for appointment ${apt.id}:`, feedbackError);
              }
            }
            return appointmentDetails;
          })
          : []
      );
      console.log("Mapped General Appointments:", generalAppointments);

      const stiAppointments: AppointmentDetails[] = await Promise.all(
        Array.isArray(stiAppointmentsResponse.data)
          ? stiAppointmentsResponse.data.map(async (apt: any) => {
            const appointmentDetails: AppointmentDetails = {
              id: apt.id,
              consultantId: apt.consultantDoctor?.id,
              consultant: apt.consultantDoctor ? {
                id: apt.consultantDoctor.id,
                firstName: apt.consultantDoctor.firstName || '',
                lastName: apt.consultantDoctor.lastName || '',
                profilePicture: apt.consultantDoctor.profilePicture || apt.consultantDoctor.avatar,
                specialties: apt.consultantDoctor.specialties || [],
                qualification: apt.consultantDoctor.qualification,
                experience: apt.consultantDoctor.experience,
                rating: apt.consultantDoctor.rating,
              } : undefined,
              appointmentDate: apt.sampleCollectionDate,
              status: (() => {
                switch (apt.status) {
                  case "ordered":
                  case "sample_collection_scheduled":
                    return "pending";
                  case "sample_collected":
                  case "processing":
                  case "result_ready":
                  case "result_delivered":
                  case "consultation_required":
                  case "follow_up_scheduled":
                    return "confirmed";
                  case "completed":
                    return "completed";
                  case "cancelled":
                    return "cancelled";
                  default:
                    return "pending";
                }
              })() as AppointmentStatus,
              notes: apt.processNotes,
              location: apt.sampleCollectionLocation,
              createdAt: apt.createdAt,
              updatedAt: apt.updatedAt,
              services: apt.service ? [{
                id: apt.service.id,
                name: apt.service.name,
                description: apt.service.description,
                price: apt.service.price,
                type: apt.service.type,
              }] : [],
              type: "sti_test",
              sampleCollectionDate: apt.sampleCollectionDate,
              sampleCollectionLocation: apt.sampleCollectionLocation,
              stiServiceId: apt.service?.id,
              testCode: apt.testCode,
              feedbackId: apt.feedbackId,
              feedback: undefined,
            };

            if (appointmentDetails.feedbackId) {
              try {
                const feedbackResponse = await FeedbackService.getFeedbackById(appointmentDetails.feedbackId);
                appointmentDetails.feedback = feedbackResponse;
              } catch (feedbackError) {
                console.error(`Error fetching feedback for STI appointment ${apt.id}:`, feedbackError);
              }
            }
            return appointmentDetails;
          })
          : []
      );
      console.log("Mapped STI Appointments:", stiAppointments);

      const combinedAppointments = [...generalAppointments, ...stiAppointments];
      console.log("Combined Appointments before sort:", combinedAppointments);

      combinedAppointments.sort((a, b) => {
        const dateA = new Date(a.appointmentDate).getTime();
        const dateB = new Date(b.appointmentDate).getTime();
        return dateB - dateA;
      });
      console.log("Combined Appointments after sort:", combinedAppointments);

      setAppointments(combinedAppointments);

      // Calculate total count and total pages from both responses
      const totalGeneral = generalAppointmentsResponse.meta?.totalItems || 0;
      const totalSti = stiAppointmentsResponse.meta?.totalItems || 0;
      const combinedTotal = totalGeneral + totalSti;
      setTotalAppointmentsCount(combinedTotal);
      setTotalPages(Math.ceil(combinedTotal / itemsPerPage));

    } catch (error: any) {
      console.error("Error fetching appointments:", error);
      setAppointments([]);
      setTotalAppointmentsCount(0);
      setTotalPages(1);
      toast({
        title: "Lỗi",
        description: `Không thể tải danh sách lịch hẹn. Vui lòng thử lại. Lỗi: ${error.message || error}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // New handler for chat button
  const handleEnterChat = (appointment: AppointmentDetails) => {
    router.push(`/chat/${appointment.id}`);
  };

  const handlePayAppointment = (appointment: AppointmentDetails) => {
    let paymentUrl = '';
    if (appointment.type === "consultation") {
      paymentUrl = `/appointments/payment/${appointment.id}`;
    } else if (appointment.type === "sti_test") {
      paymentUrl = `/sti-testing/payment/${appointment.id}`; // Assuming STI payment path
    }

    if (paymentUrl) {
      router.push(paymentUrl);
    } else {
      toast({
        title: "Lỗi",
        description: "Không thể tạo URL thanh toán cho lịch hẹn này.",
        variant: "destructive",
      });
    }
  };

  const handleCancelAppointment = (appointment: AppointmentDetails) => {
    setSelectedAppointment(appointment);
    setIsCancelDialogOpen(true);
  };

  const handleConfirmCancel = async (reason: string) => {
    if (!selectedAppointment) return;

    setIsCancelling(true);
    try {
      await AppointmentService.cancelAppointment(selectedAppointment.id, { cancellationReason: reason });

      // Update local state
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === selectedAppointment.id
            ? { ...apt, status: "cancelled" as AppointmentStatus, cancellationReason: reason }
            : apt
        )
      );

      toast({
        title: "Hủy lịch thành công",
        description: "Lịch hẹn đã được hủy thành công",
      });

      setIsCancelDialogOpen(false);
      setSelectedAppointment(null);
    } catch (error: any) {
      console.error("Error cancelling appointment:", error);
      toast({
        title: "Lỗi",
        description: "Không thể hủy lịch hẹn. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleRateAppointment = (appointment: AppointmentDetails) => {
    setSelectedAppointment(appointment);
    setIsRatingDialogOpen(true);
  };

  const handleConfirmFeedback = async (
    rating: number,
    comment: string,
    isAnonymous: boolean
  ) => {
    if (!selectedAppointment || !user) return;

    setIsSubmittingFeedback(true);
    try {
      const feedbackData: CreateFeedbackDto = {
        userId: user.id,
        serviceId: selectedAppointment.services?.[0]?.id || '', // Assuming first service is primary
        appointmentId: selectedAppointment.id,
        consultantId: selectedAppointment.consultantId || '',
        rating,
        comment,
        isAnonymous,
      };

      const response = await FeedbackService.createFeedback(feedbackData);
      
      // Update local state with new feedback
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === selectedAppointment.id
            ? { ...apt, feedbackId: response.id, feedback: response }
            : apt
        )
      );

      toast({
        title: "Gửi phản hồi thành công",
        description: "Cảm ơn bạn đã chia sẻ trải nghiệm.",
      });

      setIsRatingDialogOpen(false);
      setSelectedAppointment(null);
    } catch (error: any) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Lỗi",
        description: `Không thể gửi phản hồi. Vui lòng thử lại. Lỗi: ${error.message || error}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleViewDetails = (appointment: AppointmentDetails) => {
    setSelectedAppointment(appointment);
    setDetailsDialogOpen(true);
  };

  const getFilteredAppointments = (status?: AppointmentStatus) => {
    if (!status) return appointments;
    return appointments.filter(apt => apt.status === status);
  };

  const upcomingAppointments = appointments.filter(apt => 
    !AppointmentService.isPastAppointment(apt.appointmentDate) && 
    ["pending", "confirmed", "scheduled"].includes(apt.status)
  );

  const pastAppointments = appointments.filter(apt => 
    AppointmentService.isPastAppointment(apt.appointmentDate) || 
    ["completed", "cancelled", "no_show"].includes(apt.status)
  );

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleFirstPage = () => {
    setCurrentPage(1);
  };

  const handleLastPage = () => {
    setCurrentPage(totalPages);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    if (startPage > 1) {
      pageNumbers.push(1);
      if (startPage > 2) {
        pageNumbers.push(-1);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push(-1);
      }
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Lịch hẹn của tôi</h1>
        <p className="text-muted-foreground">
          Quản lý và theo dõi các lịch hẹn tư vấn của bạn
        </p>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">
            Sắp tới ({upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Đã qua ({pastAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            Tất cả ({totalAppointmentsCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingAppointments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Chưa có lịch hẹn nào</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Bạn chưa có lịch hẹn nào sắp tới. Hãy đặt lịch tư vấn ngay!
                </p>
                <Button onClick={() => window.location.href = '/consultant'}>
                  Đặt lịch tư vấn
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {upcomingAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onCancel={handleCancelAppointment}
                  onViewDetails={handleViewDetails}
                  onEnterChat={handleEnterChat}
                  onRateAppointment={handleRateAppointment}
                  onPayAppointment={handlePayAppointment}
                  getStatusIcon={getStatusIcon}
                  getStatusColor={getStatusColor}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastAppointments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Chưa có lịch sử</h3>
                <p className="text-muted-foreground text-center">
                  Bạn chưa có lịch hẹn nào đã qua.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pastAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onCancel={handleCancelAppointment}
                  onViewDetails={handleViewDetails}
                  onEnterChat={handleEnterChat}
                  onRateAppointment={handleRateAppointment}
                  onPayAppointment={handlePayAppointment}
                  getStatusIcon={getStatusIcon}
                  getStatusColor={getStatusColor}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {appointments.length === 0 && totalAppointmentsCount === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Chưa có lịch hẹn nào</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Bạn chưa có lịch hẹn nào. Hãy đặt lịch tư vấn ngay!
                </p>
                <Button onClick={() => window.location.href = '/consultant'}>
                  Đặt lịch tư vấn
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4">
                {appointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onCancel={handleCancelAppointment}
                    onViewDetails={handleViewDetails}
                    onEnterChat={handleEnterChat}
                    onRateAppointment={handleRateAppointment}
                    onPayAppointment={handlePayAppointment}
                    getStatusIcon={getStatusIcon}
                    getStatusColor={getStatusColor}
                  />
                ))}
              </div>
              <div className="flex justify-between items-center mt-4">
                <PaginationInfo
                  totalItems={totalAppointmentsCount}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  itemName="lịch hẹn"
                />
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageNumbers={getPageNumbers()}
                  hasNextPage={currentPage < totalPages}
                  hasPreviousPage={currentPage > 1}
                  onPageChange={handlePageChange}
                  onNextPage={handleNextPage}
                  onPreviousPage={handlePreviousPage}
                  onFirstPage={handleFirstPage}
                  onLastPage={handleLastPage}
                />
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Cancel Dialog */}
      {selectedAppointment && (
        <CancelDialog
          appointment={selectedAppointment}
          isOpen={isCancelDialogOpen}
          onClose={() => {
            setIsCancelDialogOpen(false);
            setSelectedAppointment(null);
          }}
          onConfirm={handleConfirmCancel}
          isLoading={isCancelling}
        />
      )}

      {/* Rating Dialog */}
      {selectedAppointment && isRatingDialogOpen && (
        <RatingDialog
          appointment={selectedAppointment}
          isOpen={isRatingDialogOpen}
          onClose={() => {
            setIsRatingDialogOpen(false);
            setSelectedAppointment(null);
          }}
          onConfirm={handleConfirmFeedback}
          isLoading={isSubmittingFeedback}
        />
      )}

      {/* Details Dialog */}
      {selectedAppointment && (
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Chi tiết lịch hẹn</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedAppointment.consultant?.profilePicture} alt={`${selectedAppointment.consultant?.firstName} ${selectedAppointment.consultant?.lastName}`} />
                  <AvatarFallback>
                    {`${selectedAppointment.consultant?.firstName?.[0] || ''}${selectedAppointment.consultant?.lastName?.[0] || ''}`}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedAppointment.consultant ? `${selectedAppointment.consultant.firstName} ${selectedAppointment.consultant.lastName}` : "N/A"}
                  </h3>
                  <p className="text-muted-foreground">{selectedAppointment.consultant?.qualification || "N/A"}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{selectedAppointment.consultant?.rating ? `${selectedAppointment.consultant.rating}/5` : "N/A"}</span>
                    </div>
                    <Badge className={getStatusColor(selectedAppointment.status)}>
                      {getStatusIcon(selectedAppointment.status)}
                      <span className="ml-1">{AppointmentService.getStatusText(selectedAppointment.status)}</span>
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Ngày hẹn:</Label>
                  <p className="text-sm">
                    {(() => {
                      const dateObj = new Date(selectedAppointment.appointmentDate);
                      return !isNaN(dateObj.getTime()) ? format(dateObj, "EEEE, dd/MM/yyyy", { locale: vi }) : "N/A";
                    })()}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Giờ hẹn:</Label>
                  <p className="text-sm">
                    {(() => {
                      const dateObj = new Date(selectedAppointment.appointmentDate);
                      return !isNaN(dateObj.getTime()) ? format(dateObj, "HH:mm") : "N/A";
                    })()}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Hình thức:</Label>
                  <p className="text-sm">
                    {selectedAppointment.location === "online" ? "Tư vấn trực tuyến" : "Tại phòng khám"}
                  </p>
                </div>
                {selectedAppointment.services && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Dịch vụ:</Label>
                    <p className="text-sm">
                      {selectedAppointment.services.map(s => s.name).join(", ")}
                      {selectedAppointment.type === "sti_test" && selectedAppointment.testCode && ` (Mã: ${selectedAppointment.testCode})`}
                    </p>
                  </div>
                )}
              </div>

              {selectedAppointment.notes && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Ghi chú:</Label>
                  <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                    {selectedAppointment.notes}
                  </div>
                </div>
              )}

              {selectedAppointment.cancellationReason && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-red-600">Lý do hủy:</Label>
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                    {selectedAppointment.cancellationReason}
                  </div>
                </div>
              )}

              {/* Display Feedback if available */}
              {selectedAppointment.feedback && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-semibold">Phản hồi của bạn:</h4>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon
                          key={star}
                          className={`w-5 h-5 ${
                            star <= selectedAppointment.feedback!.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="text-sm ml-2">({selectedAppointment.feedback.rating}/5)</span>
                    </div>
                    {selectedAppointment.feedback.comment && (
                      <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                        {selectedAppointment.feedback.comment}
                      </div>
                    )}
                    {selectedAppointment.feedback.isAnonymous && (
                      <p className="text-xs text-muted-foreground"> (Phản hồi ẩn danh)</p>
                    )}
                  </div>
                  {selectedAppointment.feedback.staffResponse && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Phản hồi từ nhân viên:</h4>
                      <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg border border-blue-200">
                        {selectedAppointment.feedback.staffResponse}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default UserAppointmentManagement;
