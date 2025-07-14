"use client";

import React, { useState, useEffect } from "react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  CalendarIcon,
  Clock,
  Star,
  CheckCircle,
  Loader2,
  Video,
  Award,
  Calendar as CalendarIconSmall,
  User,
  MapPin,
  Phone,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  Heart,
  Shield,
  Zap,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ConsultantService, ConsultantProfile } from "@/services/consultant.service";
import { AppointmentService, Appointment } from "@/services/appointment.service";
import { useConsultationBooking } from "@/hooks/use-consultation-booking";
import { format, addDays, isBefore, isToday, isSameDay } from "date-fns";
import { vi } from "date-fns/locale";

interface TimeSlot {
  id: string;
  time: string;
  isAvailable: boolean;
  consultantId: string;
  consultantName: string; // Keep this for display purposes
  consultantAvatar?: string; // Keep this for display purposes
  consultantRating?: number; // Keep this for display purposes
  consultantExperience?: string; // Keep this for display purposes
  consultantSpecialties?: string[]; // Keep this for display purposes
  consultationFee?: number; // Keep this for display purposes
}

interface BookingStep {
  step: number;
  title: string;
  description: string;
}

const BOOKING_STEPS: BookingStep[] = [
  {
    step: 1,
    title: "Chọn tư vấn viên",
    description: "Tìm và chọn tư vấn viên phù hợp",
  },
  {
    step: 2,
    title: "Chọn thời gian",
    description: "Chọn ngày và giờ phù hợp",
  },
  {
    step: 3,
    title: "Thông tin tư vấn",
    description: "Cung cấp thông tin chi tiết",
  },
  {
    step: 4,
    title: "Xác nhận đặt lịch",
    description: "Xem lại và xác nhận",
  },
];

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const OnlineConsultationBooking: React.FC = () => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { bookAppointment, getFieldError, clearErrors, isLoading: isBookingLoading, errors } = useConsultationBooking();
  
  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [consultants, setConsultants] = useState<ConsultantProfile[]>([]);
  const [selectedConsultant, setSelectedConsultant] = useState<ConsultantProfile | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [consultationReason, setConsultationReason] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [preferredContactMethod, setPreferredContactMethod] = useState<"video" | "phone" | "chat">("video");
  
  // Loading states
  const [isLoadingConsultants, setIsLoadingConsultants] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  
  // Dialog states
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);

  // Fetch consultants on component mount
  useEffect(() => {
    fetchConsultants();
  }, []);

  // Fetch available slots when consultant and date are selected
  useEffect(() => {
    console.log("useEffect for fetchAvailableSlots triggered. selectedConsultant:", selectedConsultant, "selectedDate:", selectedDate);
    if (selectedConsultant && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedConsultant, selectedDate]);

  const fetchConsultants = async () => {
    setIsLoadingConsultants(true);
    try {
      const consultantsData: ConsultantProfile[] = await ConsultantService.getAll();
      console.log("Consultants API Response:", consultantsData); // Log the full response
      setConsultants(consultantsData);
    } catch (error: any) {
      console.error("Error fetching consultants in fetchConsultants:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách tư vấn viên.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingConsultants(false);
    }
  };

  const fetchAvailableSlots = async () => {
    if (!selectedConsultant || !selectedDate) {
      console.log("fetchAvailableSlots skipped: selectedConsultant or selectedDate is missing.");
      return;
    }
    setIsLoadingSlots(true);
    try {
      console.log("Fetching availability for:", {
        consultantId: selectedConsultant.id,
        selectedDate: selectedDate,
      }); // Log parameters
      const response: any = await ConsultantService.getAvailability(
        selectedConsultant.id,
        selectedDate
      );
      console.log("Availability API Raw Response:", response); // Log the raw API response
      // Map the API response to the TimeSlot interface, extracting consultant details
      const availableSlotsData: TimeSlot[] = Array.isArray(response?.data)
        ? response.data.map((slot: any) => ({
            id: slot.id,
            time: slot.startTime, // Assuming startTime is the relevant time for the slot
            isAvailable: slot.isAvailable,
            consultantId: slot.consultantProfile.id,
            consultantName: `${slot.consultantProfile.user?.firstName} ${slot.consultantProfile.user?.lastName}`, // Use user's first/last name
            consultantAvatar: slot.consultantProfile.user?.profilePicture || slot.consultantProfile.avatar, // Use user's profile picture or consultant's avatar
            consultantRating: slot.consultantProfile.rating,
            consultantExperience: slot.consultantProfile.experience,
            consultantSpecialties: slot.consultantProfile.specialties,
            consultationFee: slot.consultantProfile.consultationFee,
          }))
        : [];
      console.log("Mapped Available Slots:", availableSlotsData); // Log the mapped data
      setAvailableSlots(availableSlotsData);
    } catch (error: any) {
      console.error("Error fetching available slots:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải lịch trống của tư vấn viên.",
        variant: "destructive",
      });
      setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleConsultantSelect = (consultant: ConsultantProfile) => {
    setSelectedConsultant(consultant);
    setCurrentStep(2);
    setSelectedDate(undefined);
    setSelectedSlot(null);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setCurrentStep(3);
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleBookingSubmit = () => {
    if (!consultationReason.trim()) {
      toast({
        title: "Thông tin chưa đầy đủ",
        description: "Vui lòng nhập lý do tư vấn.",
        variant: "destructive",
      });
      return;
    }
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedConsultant || !selectedDate || !selectedSlot) return;
    
    const success = await bookAppointment(
      selectedConsultant,
      selectedDate,
      selectedSlot.time,
      {
        consultationReason,
        symptoms,
        additionalNotes,
        preferredContactMethod,
      }
    );

    if (success) {
      setIsConfirmDialogOpen(false);
      setIsSuccessDialogOpen(true);
    }
  };

  const resetBooking = () => {
    setCurrentStep(1);
    setSelectedConsultant(null);
    setSelectedDate(undefined);
    setSelectedSlot(null);
    setConsultationReason("");
    setSymptoms("");
    setAdditionalNotes("");
    setIsSuccessDialogOpen(false);
  };

  const renderStepIndicator = () => (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {BOOKING_STEPS.map((step, index) => (
          <div key={step.step} className="flex items-center">
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step.step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > step.step ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  step.step
                )}
              </div>
              <div className="ml-3 hidden sm:block">
                <div className="text-sm font-medium">{step.title}</div>
                <div className="text-xs text-muted-foreground">{step.description}</div>
              </div>
            </div>
            {index < BOOKING_STEPS.length - 1 && (
              <div className="w-8 sm:w-16 h-0.5 bg-muted mx-2 sm:mx-4" />
            )}
          </div>
        ))}
      </div>
      <div className="mt-4">
        <Progress value={(currentStep / BOOKING_STEPS.length) * 100} className="w-full" />
      </div>
    </div>
  );

  const renderConsultantSelection = () => (
    <div className="w-full max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Chọn tư vấn viên</h2>
        <p className="text-muted-foreground">Chọn tư vấn viên phù hợp với nhu cầu của bạn</p>
      </div>
      
      {isLoadingConsultants ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {consultants.map((consultant) => (
            <Card
              key={consultant.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedConsultant?.id === consultant.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => handleConsultantSelect(consultant)}
            >
              <CardHeader className="text-center">
                <Avatar className="w-20 h-20 mx-auto mb-4">
                  <AvatarImage src={consultant.user?.profilePicture || consultant.avatar} alt={`${consultant.user?.firstName} ${consultant.user?.lastName}`} />
                  <AvatarFallback>
                    {`${consultant.user?.firstName ? consultant.user.firstName[0] : ""}${consultant.user?.lastName ? consultant.user.lastName[0] : ""}`}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-lg">{`${consultant.user?.firstName} ${consultant.user?.lastName}`}</CardTitle>
                <CardDescription>{consultant.qualification}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{consultant.rating}/5</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  <span className="text-sm">{consultant.experience}</span>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {consultant.specialties.slice(0, 2).map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                  {consultant.specialties.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{consultant.specialties.length - 2}
                    </Badge>
                  )}
                </div>
                
                <div className="text-center pt-2">
                  <div className="text-lg font-semibold text-primary">
                    {consultant.consultationFee.toLocaleString()}đ
                  </div>
                  <div className="text-xs text-muted-foreground">/ buổi tư vấn</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderTimeSelection = () => (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Chọn thời gian</h2>
        <p className="text-muted-foreground">
          Chọn ngày và giờ phù hợp cho buổi tư vấn với {selectedConsultant?.user?.firstName} {selectedConsultant?.user?.lastName}
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIconSmall className="w-5 h-5" />
              Chọn ngày
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) => isBefore(date, new Date()) || date.getDay() === 0}
              className="rounded-md border"
              locale={vi}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Chọn giờ
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedDate ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIconSmall className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Vui lòng chọn ngày trước</p>
              </div>
            ) : isLoadingSlots ? (
              <LoadingSpinner />
            ) : (
              <div className="space-y-2">
                <div className="text-sm font-medium mb-3">
                  {format(selectedDate, "EEEE, dd/MM/yyyy", { locale: vi })}
                </div>
                {availableSlots.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Không có lịch trống cho ngày này.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {availableSlots.map((slot) => (
                      <Button
                        key={slot.id}
                        variant={selectedSlot?.id === slot.id ? "default" : "outline"}
                        className={`justify-start ${
                          !slot.isAvailable ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        disabled={!slot.isAvailable}
                        onClick={() => handleSlotSelect(slot)}
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        {slot.time}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderConsultationInfo = () => (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Thông tin tư vấn</h2>
        <p className="text-muted-foreground">
          Cung cấp thông tin chi tiết để tư vấn viên chuẩn bị tốt nhất
        </p>
      </div>
      
      <Card>
        <CardContent className="space-y-6 pt-6">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-medium">
              Lý do tư vấn <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Vui lòng mô tả lý do bạn muốn tư vấn..."
              value={consultationReason}
              onChange={(e) => {
                setConsultationReason(e.target.value);
                clearErrors();
              }}
              className={`min-h-[100px] ${getFieldError("consultationReason") ? "border-red-500" : ""}`}
            />
            {getFieldError("consultationReason") && (
              <p className="text-sm text-red-500">{getFieldError("consultationReason")}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="symptoms" className="text-sm font-medium">
              Triệu chứng (nếu có)
            </Label>
            <Textarea
              id="symptoms"
              placeholder="Mô tả các triệu chứng bạn đang gặp phải..."
              value={symptoms}
              onChange={(e) => {
                setSymptoms(e.target.value);
                clearErrors();
              }}
              className={`min-h-[80px] ${getFieldError("symptoms") ? "border-red-500" : ""}`}
            />
            {getFieldError("symptoms") && (
              <p className="text-sm text-red-500">{getFieldError("symptoms")}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Ghi chú thêm
            </Label>
            <Textarea
              id="notes"
              placeholder="Bất kỳ thông tin nào khác bạn muốn chia sẻ..."
              value={additionalNotes}
              onChange={(e) => {
                setAdditionalNotes(e.target.value);
                clearErrors();
              }}
              className={`min-h-[80px] ${getFieldError("additionalNotes") ? "border-red-500" : ""}`}
            />
            {getFieldError("additionalNotes") && (
              <p className="text-sm text-red-500">{getFieldError("additionalNotes")}</p>
            )}
          </div>
          
          <div className="space-y-3">
            <Label className="text-sm font-medium">Phương thức tư vấn</Label>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant={preferredContactMethod === "video" ? "default" : "outline"}
                onClick={() => setPreferredContactMethod("video")}
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <Video className="w-5 h-5" />
                <span className="text-xs">Video call</span>
              </Button>
              <Button
                variant={preferredContactMethod === "phone" ? "default" : "outline"}
                onClick={() => setPreferredContactMethod("phone")}
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <Phone className="w-5 h-5" />
                <span className="text-xs">Điện thoại</span>
              </Button>
              <Button
                variant={preferredContactMethod === "chat" ? "default" : "outline"}
                onClick={() => setPreferredContactMethod("chat")}
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="text-xs">Chat</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderConfirmation = () => (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Xác nhận đặt lịch</h2>
        <p className="text-muted-foreground">Vui lòng kiểm tra lại thông tin trước khi xác nhận</p>
      </div>
      
      <Card>
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={selectedConsultant?.user?.profilePicture || selectedConsultant?.avatar} alt={`${selectedConsultant?.user?.firstName} ${selectedConsultant?.user?.lastName}`} />
                <AvatarFallback>
                  {`${selectedConsultant?.user?.firstName ? selectedConsultant.user.firstName[0] : ""}${selectedConsultant?.user?.lastName ? selectedConsultant.user.lastName[0] : ""}`}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-lg">{`${selectedConsultant?.user?.firstName} ${selectedConsultant?.user?.lastName}`}</div>
                <div className="text-sm text-muted-foreground">{selectedConsultant?.qualification}</div>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">{selectedConsultant?.rating}/5</span>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Ngày tư vấn:</span>
                <span className="font-medium">
                  {selectedDate && format(selectedDate, "EEEE, dd/MM/yyyy", { locale: vi })}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Thời gian:</span>
                <span className="font-medium">{selectedSlot?.time}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Phương thức:</span>
                <div className="flex items-center gap-2">
                  {preferredContactMethod === "video" && <Video className="w-4 h-4" />}
                  {preferredContactMethod === "phone" && <Phone className="w-4 h-4" />}
                  {preferredContactMethod === "chat" && <MessageSquare className="w-4 h-4" />}
                  <span className="font-medium">
                    {preferredContactMethod === "video" ? "Video call" : 
                     preferredContactMethod === "phone" ? "Điện thoại" : "Chat"}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Chi phí:</span>
                <span className="font-semibold text-lg text-primary">
                  {selectedConsultant?.consultationFee?.toLocaleString()}đ
                </span>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div className="text-sm font-medium">Lý do tư vấn:</div>
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                {consultationReason}
              </div>
            </div>
            
            {symptoms && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Triệu chứng:</div>
                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                  {symptoms}
                </div>
              </div>
            )}
            
            {additionalNotes && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Ghi chú:</div>
                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                  {additionalNotes}
                </div>
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );

  const renderNavigationButtons = () => (
    <div className="flex justify-between items-center mt-8">
      <Button
        variant="outline"
        onClick={handlePrevious}
        disabled={currentStep === 1}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại
      </Button>
      
      <div className="flex items-center gap-2">
        {currentStep < 3 && (
          <Button
            onClick={handleNext}
            disabled={
              (currentStep === 1 && !selectedConsultant) ||
              (currentStep === 2 && (!selectedDate || !selectedSlot))
            }
            className="flex items-center gap-2"
          >
            Tiếp tục
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
        
        {currentStep === 3 && (
          <Button
            onClick={handleBookingSubmit}
            disabled={!consultationReason.trim()}
            className="flex items-center gap-2"
          >
            Xem lại đặt lịch
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-2xl mx-auto text-center py-12">
        <div className="bg-muted/50 rounded-lg p-8">
          <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Yêu cầu đăng nhập</h2>
          <p className="text-muted-foreground mb-6">
            Vui lòng đăng nhập để sử dụng dịch vụ tư vấn trực tuyến
          </p>
          <Button onClick={() => window.location.href = '/auth/login'}>
            Đăng nhập ngay
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Tư vấn trực tuyến</h1>
          <p className="text-xl opacity-90 mb-8">
            Kết nối với các chuyên gia tư vấn sức khỏe giới tính hàng đầu
          </p>
          <div className="flex justify-center items-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span>Bảo mật tuyệt đối</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <span>Tư vấn tức thì</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              <span>Chăm sóc tận tâm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {renderStepIndicator()}
        
        {currentStep === 1 && renderConsultantSelection()}
        {currentStep === 2 && renderTimeSelection()}
        {currentStep === 3 && renderConsultationInfo()}
        {currentStep === 4 && renderConfirmation()}
        
        {renderNavigationButtons()}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận đặt lịch tư vấn</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn đặt lịch tư vấn với {selectedConsultant?.user?.firstName} {selectedConsultant?.user?.lastName} vào {selectedDate && format(selectedDate, "dd/MM/yyyy", { locale: vi })} lúc {selectedSlot?.time}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleConfirmBooking} disabled={isBookingLoading}>
              {isBookingLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Xác nhận đặt lịch"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              Đặt lịch thành công!
            </DialogTitle>
            <DialogDescription className="text-center">
              Lịch tư vấn của bạn đã được ghi nhận. Tư vấn viên sẽ liên hệ với bạn trong thời gian sớm nhất.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-center">
            <Button onClick={resetBooking} className="w-full">
              Đặt lịch mới
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OnlineConsultationBooking;
