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
import { UpdateAppointmentStatusDialog } from "@/components/UpdateAppointmentStatusDialog";
import { AppointmentDetailsDialog } from "@/components/AppointmentDetailsDialog";
import { translatedAppointmentStatus } from "@/lib/translations";
import { API_FEATURES } from "@/config/api";
import { Pagination } from "@/components/ui/pagination";
import { PaginationInfo } from "@/components/ui/pagination-info";
import { ChatService, ChatRoom } from "@/services/chat.service"; // Import ChatService and ChatRoom
import { Appointment } from "@/types/api.d"; // Import global Appointment type
import { User } from "@/services/user.service"; // Import User type
import { ConsultantProfile } from "@/services/consultant.service"; // Import ConsultantProfile type
import { EditConsultantProfileDialog } from "@/components/EditConsultantProfileDialog"; // Import the new dialog

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

  console.log("ConsultantPage: user", user);
  console.log("ConsultantPage: isAuthLoading", isAuthLoading);

  // If user is loading or not a consultant, show appropriate message/component
  if (isAuthLoading) {
    console.log("ConsultantPage: Auth is loading.");
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Đang tải...</p>
      </div>
    );
  }

  if (!user || (typeof user.role === "string" && user.role !== "consultant") || (typeof user.role === "object" && user.role?.name !== "consultant")) {
    console.log("ConsultantPage: User is not a consultant or not logged in.");
    return <OnlineConsultationBooking />;
  }

  console.log("ConsultantPage: user.consultantProfile", user.consultantProfile);
  if (!user.consultantProfile) {
    console.log("ConsultantPage: User is a consultant but has no profile. Showing CreateConsultantProfile.");
    return <CreateConsultantProfile />;
  }

  return <ConsultantDashboard />;
}

function CreateConsultantProfile() {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isEditProfileDialogOpen, setIsEditProfileDialogOpen] = useState(false);

  const handleSaveProfile = (updatedProfile: ConsultantProfile) => {
    // This function is called when the dialog saves a profile
    // The AuthContext's user state is already updated by the dialog's onSubmit
    // We just need to close the dialog and potentially refresh the page if needed
    setIsEditProfileDialogOpen(false);
    toast({
      title: "Thành công",
      description: "Đã tạo hồ sơ tư vấn viên. Hồ sơ đang chờ duyệt.",
    });
    // router.refresh(); // No need to refresh here, AuthContext update should trigger re-render
  };

  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-3xl font-bold mb-6">Tạo hồ sơ tư vấn viên</h1>
      <p className="text-lg mb-8">
        Bạn chưa có hồ sơ tư vấn viên. Vui lòng tạo hồ sơ để bắt đầu quản lý lịch làm việc và cuộc hẹn.
      </p>
      <Button onClick={() => setIsEditProfileDialogOpen(true)} disabled={loading}>
        {loading ? "Đang tải..." : "Tạo hồ sơ tư vấn viên"}
      </Button>

      <EditConsultantProfileDialog
        isOpen={isEditProfileDialogOpen}
        onClose={() => setIsEditProfileDialogOpen(false)}
        currentProfile={null} // No current profile to edit, so pass null
        onSave={handleSaveProfile}
      />
    </div>
  );
}

function ConsultantDashboard() {
  const { user, setUser } = useAuth(); // Ensure setUser is available for dashboard to update profile
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
  const [isEditProfileDialogOpen, setIsEditProfileDialogOpen] = useState(false); // State for dialog

  // Pagination states for appointments
  const [currentPage, setCurrentPage] = useState(API_FEATURES.PAGINATION.DEFAULT_PAGE);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const limit = API_FEATURES.PAGINATION.DEFAULT_LIMIT;

  useEffect(() => {
    if (user?.id) {
      fetchAppointments(user.id);
      fetchFeedbacks(user.id);
      fetchDailySchedule(user.id, selectedDate || new Date());
    }
  }, [user, selectedDate, currentPage]); // Add currentPage to dependencies

  const fetchAppointments = async (consultantId: string) => {
    setLoadingAppointments(true);
    setErrorAppointments(null);
    try {
      const response = await apiClient.get<{ data: Appointment[]; meta: { totalItems: number; totalPages: number } }>(
        `${API_ENDPOINTS.APPOINTMENTS.BASE}?consultantId=${consultantId}&page=${currentPage}&limit=${limit}`
      );
      setAppointments(response.data || []);
      setTotalAppointments(response.meta.totalItems);
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

      const groupedSchedule: { [key: string]: { time: string; isBooked: boolean } } = {};

      response.data.forEach((slot: any) => {
        const timeSlot = `${slot.startTime} - ${slot.endTime}`;
        if (!groupedSchedule[timeSlot]) {
          groupedSchedule[timeSlot] = { time: timeSlot, isBooked: false };
        }
        if (!slot.isAvailable) {
          groupedSchedule[timeSlot].isBooked = true;
        }
      });

      const finalSchedule = Object.values(groupedSchedule).map(item => ({
        time: item.time,
        status: item.isBooked ? "Đã đặt" : "Trống",
      }));

      setDailySchedule(finalSchedule);
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

  const handleSaveProfile = (updatedProfile: ConsultantProfile) => {
    // This function is called when the dialog saves a profile
    // The AuthContext's user state is already updated by the dialog's onSubmit
    // We just need to close the dialog
    setIsEditProfileDialogOpen(false);
    toast({
      title: "Thành công",
      description: "Đã cập nhật hồ sơ tư vấn viên.",
    });
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
              <Button
                onClick={() => setIsEditProfileDialogOpen(true)}
                className="mb-4"
              >
                Chỉnh sửa hồ sơ
              </Button>
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
                        <TableCell>{appointment.service?.name || "Tư vấn trực tuyến"}</TableCell>
                        <TableCell>
                          <Badge>{translatedAppointmentStatus(appointment.status)}</Badge>
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
                            <AppointmentDetailsDialog appointment={appointment} />
                            <UpdateAppointmentStatusDialog
                              appointmentId={appointment.id}
                              onStatusUpdate={() => {
                                if (user) {
                                  fetchAppointments(user.id);
                                }
                              }}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                try {
                                  const chatRoom: ChatRoom = await ChatService.getChatRoomByAppointmentId(appointment.id);
                                  router.push(`/chat/${chatRoom.id}`);
                                } catch (err: any) {
                                  toast({
                                    title: "Lỗi",
                                    description: `Không thể vào phòng chat: ${err.message || "Đã xảy ra lỗi không xác định."}`,
                                    variant: "destructive",
                                  });
                                  console.error("Error getting chat room or sending initial message:", err);
                                }
                              }}
                            >
                              Chat
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center">Không có cuộc hẹn nào.</p>
              )}
              {appointments.length > 0 && (
                <div className="flex justify-between items-center mt-4">
                  <PaginationInfo
                    totalItems={totalAppointments}
                    itemsPerPage={limit}
                    currentPage={currentPage}
                    itemName="cuộc hẹn"
                  />
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(totalAppointments / limit)}
                    pageNumbers={(() => {
                      const pageNumbers = [];
                      const maxPagesToShow = 5;
                      let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
                      let endPage = Math.min(Math.ceil(totalAppointments / limit), startPage + maxPagesToShow - 1);

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

                      if (endPage < Math.ceil(totalAppointments / limit)) {
                        if (endPage < Math.ceil(totalAppointments / limit) - 1) {
                          pageNumbers.push(-1);
                        }
                        pageNumbers.push(Math.ceil(totalAppointments / limit));
                      }
                      return pageNumbers;
                    })()}
                    hasNextPage={currentPage < Math.ceil(totalAppointments / limit)}
                    hasPreviousPage={currentPage > 1}
                    onPageChange={setCurrentPage}
                    onNextPage={() => setCurrentPage(prev => prev + 1)}
                    onPreviousPage={() => setCurrentPage(prev => prev - 1)}
                    onFirstPage={() => setCurrentPage(1)}
                    onLastPage={() => setCurrentPage(Math.ceil(totalAppointments / limit))}
                  />
                </div>
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
      {user?.consultantProfile && (
        <EditConsultantProfileDialog
          isOpen={isEditProfileDialogOpen}
          onClose={() => setIsEditProfileDialogOpen(false)}
          currentProfile={user.consultantProfile}
          onSave={handleSaveProfile}
        />
      )}
    </div>
  );
}
