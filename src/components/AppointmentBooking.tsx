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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  Clock,
  MapPin,
  Star,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Types
interface ConsultantProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  specialties: string[];
  qualification: string;
  experience: string;
  bio: string;
  consultationFee: number;
  isAvailable: boolean;
  rating: number;
  avatar: string;
  availability: ConsultantAvailability[];
}

interface ConsultantAvailability {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location: string;
}

interface Appointment {
  id: string;
  consultantId: string;
  consultantName: string;
  appointmentDate: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes?: string;
  serviceIds: string[];
  location: string;
}

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className="text-center p-8">
    <p className="text-destructive">{message}</p>
  </div>
);

const AppointmentBooking: React.FC = (): JSX.Element => {
  const { toast } = useToast();
  const [consultants, setConsultants] = useState<ConsultantProfile[]>([]);
  const [selectedConsultant, setSelectedConsultant] =
    useState<ConsultantProfile | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [bookingStep, setBookingStep] = useState(1);
  const [consultationType, setConsultationType] = useState("");
  const [consultationDetails, setConsultationDetails] = useState("");
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    Appointment[]
  >([]);
  const [isLoadingConsultants, setIsLoadingConsultants] = useState(true);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Previous effects and handlers remain the same...
  useEffect(() => {
    const fetchConsultants = async () => {
      setIsLoadingConsultants(true);
      setError(null);
      try {
        const response = await fetch(
          "https://gender-healthcare.org/api/consultant-profiles"
        );
        if (!response.ok) throw new Error("Failed to fetch consultants");
        const data = await response.json();
        setConsultants(data);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load consultants";
        setError(message);
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách tư vấn viên",
          variant: "destructive",
        });
      } finally {
        setIsLoadingConsultants(false);
      }
    };
    fetchConsultants();
  }, [toast]);

  const fetchAppointments = async () => {
    setIsLoadingAppointments(true);
    try {
      const response = await fetch(
        "https://gender-healthcare.org/api/appointments"
      );
      if (!response.ok) throw new Error("Failed to fetch appointments");
      const data = await response.json();
      setUpcomingAppointments(data);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải lịch hẹn",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleConsultantSelect = async (consultant: ConsultantProfile) => {
    setIsLoadingAvailability(true);
    try {
      const response = await fetch(
        `https://gender-healthcare.org/api/consultant-availability?consultantId=${consultant.id}`
      );
      if (!response.ok)
        throw new Error("Failed to fetch consultant availability");
      const availability = await response.json();
      setSelectedConsultant({ ...consultant, availability });
      setBookingStep(2);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải lịch trống của tư vấn viên",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAvailability(false);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setBookingStep(3);
  };

  const handleDetailsSubmit = () => {
    if (consultationType && consultationDetails) {
      setConfirmationOpen(true);
    } else {
      toast({
        title: "Thông tin chưa đầy đủ",
        description: "Vui lòng điền đầy đủ thông tin cuộc hẹn",
        variant: "destructive",
      });
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedConsultant || !selectedDate || !selectedTime) return;

    setIsLoading(true);
    try {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const appointmentDate = new Date(selectedDate);
      appointmentDate.setHours(hours, minutes, 0, 0);

      const response = await fetch(
        "https://gender-healthcare.org/api/appointments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            consultantId: selectedConsultant.id,
            appointmentDate: appointmentDate.toISOString(),
            location: "online",
            notes: consultationDetails,
            serviceIds: [consultationType],
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to create appointment");

      toast({
        title: "Đặt lịch thành công",
        description: "Cuộc hẹn của bạn đã được xác nhận",
      });

      setConfirmationOpen(false);
      setBookingStep(4);
      fetchAppointments();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể đặt lịch hẹn",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const response = await fetch(
        `https://gender-healthcare.org/api/appointments/${appointmentId}/cancel`,
        { method: "POST" }
      );

      if (!response.ok) throw new Error("Failed to cancel appointment");

      toast({
        title: "Thành công",
        description: "Đã hủy lịch hẹn",
      });

      fetchAppointments();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể hủy lịch hẹn",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 bg-background">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold tracking-tight mb-2">
          Đặt lịch tư vấn
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Đặt lịch tư vấn trực tuyến với các chuyên gia về sức khỏe sinh sản và
          tình dục
        </p>
      </div>

      <Tabs defaultValue="booking" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
          <TabsTrigger value="booking">Đặt lịch</TabsTrigger>
          <TabsTrigger value="upcoming">Lịch hẹn sắp tới</TabsTrigger>
        </TabsList>

        <TabsContent value="booking" className="space-y-8">
          {/* Step indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center">
              {[1, 2, 3, 4].map((step) => (
                <React.Fragment key={step}>
                  {step > 1 && (
                    <div
                      className={`h-1 w-12 ${
                        bookingStep >= step ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                  <div
                    className={`rounded-full h-10 w-10 flex items-center justify-center 
                      ${
                        bookingStep >= step
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                  >
                    {step}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Booking steps */}
          {bookingStep === 1 && (
            <div className="space-y-6">
              {isLoadingConsultants ? (
                <LoadingSpinner />
              ) : error ? (
                <ErrorMessage message={error} />
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-center mb-6">
                    Chọn tư vấn viên
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {consultants.map((consultant) => (
                      <Card
                        key={consultant.id}
                        className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => handleConsultantSelect(consultant)}
                      >
                        <CardHeader className="p-4">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-16 w-16">
                              <AvatarImage
                                src={consultant.avatar}
                                alt={`${consultant.firstName} ${consultant.lastName}`}
                              />
                              <AvatarFallback>
                                {consultant.firstName[0]}
                                {consultant.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-lg">
                                {`${consultant.firstName} ${consultant.lastName}`}
                              </CardTitle>
                              <CardDescription>
                                {consultant.specialties.join(", ")}
                              </CardDescription>
                              <div className="flex items-center mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < consultant.rating
                                        ? "text-yellow-500 fill-yellow-500"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                                <span className="ml-1 text-sm text-muted-foreground">
                                  {consultant.rating.toFixed(1)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground mb-2">
                            Kinh nghiệm: {consultant.experience}
                          </p>
                          <p className="text-sm mb-2">
                            Phí tư vấn:{" "}
                            {consultant.consultationFee.toLocaleString("vi-VN")}
                            đ
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {bookingStep === 2 && selectedConsultant && (
            <div className="flex flex-col md:flex-row gap-8">
              {isLoadingAvailability ? (
                <LoadingSpinner />
              ) : (
                <>
                  <div className="md:w-1/3">
                    <Card>
                      <CardHeader>
                        <CardTitle>Tư vấn viên đã chọn</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage
                              src={selectedConsultant.avatar}
                              alt={`${selectedConsultant.firstName} ${selectedConsultant.lastName}`}
                            />
                            <AvatarFallback>
                              {selectedConsultant.firstName[0]}
                              {selectedConsultant.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">
                              {`${selectedConsultant.firstName} ${selectedConsultant.lastName}`}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {selectedConsultant.specialties.join(", ")}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full mt-4"
                          onClick={() => setBookingStep(1)}
                        >
                          Đổi tư vấn viên
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="md:w-2/3">
                    <Card>
                      <CardHeader>
                        <CardTitle>Chọn ngày và giờ</CardTitle>
                        <CardDescription>
                          Chọn thời gian phù hợp cho buổi tư vấn của bạn
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="md:w-1/2">
                            <CalendarComponent
                              mode="single"
                              selected={selectedDate}
                              onSelect={handleDateSelect}
                              className="rounded-md border"
                              disabled={(date: Date) => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);

                                const maxDate = new Date();
                                maxDate.setDate(today.getDate() + 30);
                                maxDate.setHours(23, 59, 59, 999);

                                return date < today || date > maxDate;
                              }}
                            />
                          </div>
                          <div className="md:w-1/2">
                            <h4 className="font-medium mb-3">
                              Khung giờ trống
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                              {selectedConsultant.availability
                                .filter(
                                  (slot) =>
                                    slot.dayOfWeek === selectedDate?.getDay()
                                )
                                .map((slot, index) => (
                                  <Button
                                    key={index}
                                    variant={
                                      selectedTime === slot.startTime
                                        ? "default"
                                        : "outline"
                                    }
                                    className="justify-start"
                                    onClick={() =>
                                      handleTimeSelect(slot.startTime)
                                    }
                                  >
                                    <Clock className="mr-2 h-4 w-4" />
                                    {slot.startTime}
                                  </Button>
                                ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </div>
          )}

          {bookingStep === 3 && selectedConsultant && (
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3">
                <Card>
                  <CardHeader>
                    <CardTitle>Thông tin cuộc hẹn</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center">
                      <Avatar className="h-12 w-12 mr-4">
                        <AvatarImage
                          src={selectedConsultant.avatar}
                          alt={`${selectedConsultant.firstName} ${selectedConsultant.lastName}`}
                        />
                        <AvatarFallback>
                          {selectedConsultant.firstName[0]}
                          {selectedConsultant.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">
                          {`${selectedConsultant.firstName} ${selectedConsultant.lastName}`}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedConsultant.specialties.join(", ")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>
                        {selectedDate?.toLocaleDateString("vi-VN", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{selectedTime}</span>
                    </div>

                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Tư vấn trực tuyến</span>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setBookingStep(2)}
                    >
                      Đổi ngày/giờ
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="md:w-2/3">
                <Card>
                  <CardHeader>
                    <CardTitle>Chi tiết buổi tư vấn</CardTitle>
                    <CardDescription>
                      Vui lòng cung cấp thông tin chi tiết về buổi tư vấn
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Loại tư vấn</label>
                      <Select
                        value={consultationType}
                        onValueChange={setConsultationType}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại tư vấn" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">
                            Sức khỏe sinh sản
                          </SelectItem>
                          <SelectItem value="contraception">
                            Tư vấn tránh thai
                          </SelectItem>
                          <SelectItem value="sti">
                            Bệnh lây truyền qua đường tình dục
                          </SelectItem>
                          <SelectItem value="reproductive">
                            Kế hoạch hóa gia đình
                          </SelectItem>
                          <SelectItem value="other">Khác</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Chi tiết</label>
                      <Textarea
                        placeholder="Mô tả vấn đề bạn muốn tư vấn..."
                        value={consultationDetails}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setConsultationDetails(e.target.value)
                        }
                        rows={5}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={handleDetailsSubmit}>
                      Xác nhận đặt lịch
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          )}

          {bookingStep === 4 && (
            <div className="max-w-md mx-auto text-center space-y-6">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold">Đặt lịch thành công!</h3>
              <p className="text-muted-foreground">
                Cuộc hẹn của bạn đã được xác nhận. Bạn sẽ nhận được email xác
                nhận cùng hướng dẫn cho buổi tư vấn trực tuyến.
              </p>
              <div className="bg-muted p-4 rounded-lg text-left">
                <h4 className="font-medium mb-2">Chi tiết cuộc hẹn:</h4>
                {selectedConsultant && (
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Tư vấn viên:</span>{" "}
                      {`${selectedConsultant.firstName} ${selectedConsultant.lastName}`}
                    </p>
                    <p>
                      <span className="font-medium">Ngày:</span>{" "}
                      {selectedDate?.toLocaleDateString("vi-VN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p>
                      <span className="font-medium">Giờ:</span> {selectedTime}
                    </p>
                    <p>
                      <span className="font-medium">Loại tư vấn:</span>{" "}
                      {consultationType}
                    </p>
                  </div>
                )}
              </div>
              <Button onClick={() => setBookingStep(1)}>
                Đặt lịch tư vấn khác
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming">
          {isLoadingAppointments ? (
            <LoadingSpinner />
          ) : (
            <div className="max-w-3xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Lịch hẹn sắp tới</CardTitle>
                  <CardDescription>
                    Xem và quản lý các lịch hẹn tư vấn của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {upcomingAppointments.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingAppointments.map((appointment) => (
                        <Card key={appointment.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">
                                {appointment.consultantName}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {new Date(
                                  appointment.appointmentDate
                                ).toLocaleDateString("vi-VN", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "numeric",
                                })}
                              </p>
                              <Badge className="mt-2">
                                {appointment.status}
                              </Badge>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={appointment.status !== "pending"}
                              onClick={() =>
                                handleCancelAppointment(appointment.id)
                              }
                            >
                              Hủy lịch hẹn
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        Bạn chưa có lịch hẹn nào sắp tới
                      </p>
                      <Button
                        className="mt-4"
                        variant="outline"
                        onClick={() => {
                          const el = document.querySelector(
                            '[data-value="booking"]'
                          );
                          if (el instanceof HTMLElement) {
                            el.click();
                          }
                        }}
                      >
                        Đặt lịch tư vấn
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận cuộc hẹn</DialogTitle>
            <DialogDescription>
              Vui lòng kiểm tra lại thông tin trước khi xác nhận
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedConsultant && (
              <>
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-4">
                    <AvatarImage
                      src={selectedConsultant.avatar}
                      alt={`${selectedConsultant.firstName} ${selectedConsultant.lastName}`}
                    />
                    <AvatarFallback>
                      {selectedConsultant.firstName[0]}
                      {selectedConsultant.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">
                      {`${selectedConsultant.firstName} ${selectedConsultant.lastName}`}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedConsultant.specialties.join(", ")}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Ngày</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedDate?.toLocaleDateString("vi-VN", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Giờ</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Loại tư vấn</p>
                    <p className="text-sm text-muted-foreground">
                      {consultationType}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Hình thức</p>
                    <p className="text-sm text-muted-foreground">
                      Tư vấn trực tuyến
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmationOpen(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button onClick={handleConfirmBooking} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Xác nhận đặt lịch"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentBooking;
