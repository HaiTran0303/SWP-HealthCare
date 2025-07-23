"use client";

import OnlineConsultationBooking from "@/components/OnlineConsultationBooking";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/services/api";
import { API_ENDPOINTS } from "@/config/api";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay } from "date-fns";
import { vi } from "date-fns/locale"; // Import Vietnamese locale

interface Appointment {
  id: string;
  appointmentDate: string;
  status: string;
  consultationType: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

interface Feedback {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
  };
}


export default function ConsultantPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  // If user is loading or not a consultant, show appropriate message/component
  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Đang tải...</p>
      </div>
    );
  }

  if (!user || (typeof user.role === "string" && user.role !== "consultant") || (typeof user.role === "object" && user.role?.name !== "consultant")) {
    return <OnlineConsultationBooking />;
  }

  return <ConsultantDashboard />;
}

function ConsultantDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [errorAppointments, setErrorAppointments] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);
  const [errorFeedbacks, setErrorFeedbacks] = useState<string | null>(null);
  const [dailySchedule, setDailySchedule] = useState<any[]>([]); // Placeholder for daily schedule

  useEffect(() => {
    if (user?.id) {
      fetchAppointments(user.id);
      fetchFeedbacks(user.id);
      fetchDailySchedule(user.id, selectedDate || new Date());
    }
  }, [user, selectedDate]);

  const fetchAppointments = async (consultantId: string) => {
    setLoadingAppointments(true);
    setErrorAppointments(null);
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const response = await apiClient.get<{ data: Appointment[] }>(
        `${API_ENDPOINTS.APPOINTMENTS.CONSULTANT_MY_APPOINTMENTS}?dateFrom=${today}&dateTo=${today}`
      );
      setAppointments(response.data || []);
    } catch (err: any) {
      console.error("Error fetching appointments:", err);
      setErrorAppointments(err?.message || "Lỗi khi tải danh sách cuộc hẹn");
    } finally {
      setLoadingAppointments(false);
    }
  };

  const fetchFeedbacks = async (consultantId: string) => {
    setLoadingFeedbacks(true);
    setErrorFeedbacks(null);
    try {
      const response = await apiClient.get<{ data: Feedback[] }>(
        `${API_ENDPOINTS.FEEDBACKS}?consultantId=${consultantId}`
      );
      setFeedbacks(response.data || []);
    } catch (err: any) {
      console.error("Error fetching feedbacks:", err);
      setErrorFeedbacks(err?.message || "Lỗi khi tải đánh giá");
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  const fetchDailySchedule = async (consultantId: string, date: Date) => {
    try {
      const dayOfWeek = date.getDay(); // 0 for Sunday, 1 for Monday, etc.
      const response = await apiClient.get<{ data: any[] }>(
        `${API_ENDPOINTS.CONSULTANTS.AVAILABILITY}/consultant?consultantId=${consultantId}&dayOfWeek=${dayOfWeek}`
      );

      const formattedSchedule = response.data.map((slot: any) => ({
        time: `${slot.startTime} - ${slot.endTime}`,
        status: slot.isAvailable ? "Trống" : "Đã đặt", // Assuming 'isAvailable' means it's free
      }));
      setDailySchedule(formattedSchedule);
    } catch (err) {
      console.error("Error fetching daily schedule:", err);
      setDailySchedule([]); // Clear schedule on error
    }
  };

  const handleStatusChange = async (appointmentId: string, status: string) => {
    try {
      await apiClient.patch(
        `${API_ENDPOINTS.APPOINTMENTS.UPDATE_STATUS(appointmentId)}`,
        { status }
      );

      toast({
        title: "Thành công",
        description: "Đã cập nhật trạng thái cuộc hẹn",
      });
      if (user?.id) {
        fetchAppointments(user.id); // Refresh appointments after status change
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error?.message || "Không thể cập nhật. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (user?.id && date) {
      fetchDailySchedule(user.id, date);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard tư vấn viên</h1>


      <Tabs defaultValue="schedule" className="space-y-6">
        <TabsList>
          <TabsTrigger value="schedule">Lịch làm việc</TabsTrigger>
          <TabsTrigger value="appointments">Cuộc hẹn</TabsTrigger>
          <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Quản lý lịch làm việc</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  className="rounded-md border"
                  locale={vi}
                />
                <div className="space-y-4">
                  <h3 className="font-semibold">Lịch trong ngày {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: vi }) : ""}</h3>
                  <div className="space-y-2">
                    {dailySchedule.length > 0 ? (
                      dailySchedule.map((slot, index) => (
                        <div key={index} className="flex justify-between items-center p-2 border rounded-lg">
                          <div>
                            <p className="font-medium">{slot.time}</p>
                            <p className="text-sm text-muted-foreground">{slot.status}</p>
                          </div>
                          <Badge className={slot.status === "Đã đặt" ? "" : "bg-gray-200 text-gray-800"}>
                            {slot.status}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">Không có lịch làm việc cho ngày này.</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Quản lý cuộc hẹn</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingAppointments ? (
                <div className="flex justify-center items-center h-40">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-2 border-gray-200" />
                </div>
              ) : errorAppointments ? (
                <p className="text-red-500 text-center">{errorAppointments}</p>
              ) : appointments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã cuộc hẹn</TableHead>
                      <TableHead>Khách hàng</TableHead>
                      <TableHead>Thời gian</TableHead>
                      <TableHead>Loại tư vấn</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>{appointment.id.substring(0, 8).toUpperCase()}</TableCell>
                        <TableCell>{`${appointment.user.firstName} ${appointment.user.lastName}`}</TableCell>
                        <TableCell>{format(new Date(appointment.appointmentDate), "dd/MM/yyyy HH:mm", { locale: vi })}</TableCell>
                        <TableCell>{appointment.consultationType}</TableCell>
                        <TableCell>
                          <Badge>{appointment.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleStatusChange(appointment.id, "confirmed")
                              }
                            >
                              Xác nhận
                            </Button>
                            <Button variant="ghost" size="sm">
                              Chi tiết
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() =>
                                router.push(`/appointments/update-status/${appointment.id}`)
                              }
                            >
                              Cập nhật trạng thái
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center">Không có cuộc hẹn nào hôm nay.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Đánh giá từ khách hàng</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingFeedbacks ? (
                <div className="flex justify-center items-center h-40">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-2 border-gray-200" />
                </div>
              ) : errorFeedbacks ? (
                <p className="text-red-500 text-center">{errorFeedbacks}</p>
              ) : feedbacks.length > 0 ? (
                <div className="space-y-4">
                  {feedbacks.map((feedback) => (
                    <div key={feedback.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{`${feedback.user.firstName} ${feedback.user.lastName}`}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(feedback.createdAt), "dd/MM/yyyy", { locale: vi })}
                          </p>
                        </div>
                        <Badge>{feedback.rating}/5 ⭐</Badge>
                      </div>
                      <p className="text-muted-foreground">
                        {feedback.comment}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center">Chưa có đánh giá nào.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
