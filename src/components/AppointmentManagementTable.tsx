"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AppointmentService,
  GetAppointmentsQuery,
  UpdateAppointmentDto,
  CancelAppointmentDto,
} from "@/services/appointment.service";
import { ChatService } from "@/services/chat.service";
import { User, UserService } from "@/services/user.service";
import { Appointment } from "@/types/api.d"; // Import Appointment from global types
import { ConsultantProfile, ConsultantService } from "@/services/consultant.service"; // Import ConsultantProfile and ConsultantService
import { API_FEATURES } from "@/config/api";
import { Pagination } from "@/components/ui/pagination";
import { PaginationInfo } from "@/components/ui/pagination-info";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns"; // For date formatting
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label"; // Ensure Label is imported
import { MessageSquare } from "lucide-react";
import { ChatRoom } from "@/services/chat.service"; // Import ChatRoom type

export default function AppointmentManagementTable() {
  const { toast } = useToast();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(API_FEATURES.PAGINATION.DEFAULT_PAGE);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [searchQuery, setSearchQuery] = useState(""); // For searching by customer/consultant name/email
  const [filterStatus, setFilterStatus] = useState<string>(""); // For filtering by appointment status
  const [filterConsultantId, setFilterConsultantId] = useState<string>(""); // For filtering by consultant
  const [filterUserId, setFilterUserId] = useState<string>(""); // For filtering by user/customer
const [usersMap, setUsersMap] = useState<Map<string, User>>(new Map()); // Cache for user details
const [consultantsMap, setConsultantsMap] = useState<Map<string, ConsultantProfile>>(new Map()); // Cache for consultant details
  const [isViewAppointmentDetailDialogOpen, setIsViewAppointmentDetailDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isAddAppointmentDialogOpen, setIsAddAppointmentDialogOpen] = useState(false);


  const limit = API_FEATURES.PAGINATION.DEFAULT_LIMIT;

const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const query: GetAppointmentsQuery = {
        page: currentPage,
        limit: limit,
        sortBy: "appointmentDate",
        sortOrder: "DESC",
      };

      if (filterStatus) {
        query.status = filterStatus as Appointment["status"] || undefined;
      }
      if (filterConsultantId) {
        query.consultantId = filterConsultantId;
      }
      if (filterUserId) {
        query.userId = filterUserId;
      }

      const response = await AppointmentService.getAllAppointments(query);
      let fetchedAppointments = response.data;

      // Fetch user details
      const userIdsToFetch = new Set<string>();
      fetchedAppointments.forEach(app => {
        if (app.userId && !usersMap.has(app.userId)) {
          userIdsToFetch.add(app.userId);
        }
      });
      const newUsersPromises = Array.from(userIdsToFetch).map(userId =>
        UserService.getUserById(userId).catch((err: any) => {
          console.error(`Error fetching user details for ${userId}:`, err);
          return null;
        })
      );
      const fetchedNewUsers = (await Promise.all(newUsersPromises)).filter(Boolean) as User[];
      const updatedUsersMap = new Map(usersMap);
      fetchedNewUsers.forEach(user => updatedUsersMap.set(user.id, user));
      setUsersMap(updatedUsersMap);

      // Fetch consultant details
      const consultantIdsToFetch = new Set<string>();
      fetchedAppointments.forEach(app => {
        if (app.consultantId && !consultantsMap.has(app.consultantId)) {
          consultantIdsToFetch.add(app.consultantId);
        }
      });

      const newConsultantsPromises = Array.from(consultantIdsToFetch).map(consultantId =>
        ConsultantService.getConsultantProfile(consultantId).catch(err => {
          console.error(`Error fetching consultant details for ${consultantId}:`, err);
          return null;
        })
      );
      const fetchedNewConsultants = (await Promise.all(newConsultantsPromises)).filter(Boolean) as ConsultantProfile[];

      const updatedConsultantsMap = new Map(consultantsMap);
      fetchedNewConsultants.forEach(consultant => updatedConsultantsMap.set(consultant.id, consultant));
      setConsultantsMap(updatedConsultantsMap);

      // Map user and consultant details into appointments
      const appointmentsWithDetails = fetchedAppointments.map(app => {
        const appointmentWithDetails = { ...app }; // Create a mutable copy

        // Map user details
        if (app.userId && updatedUsersMap.has(app.userId)) {
          appointmentWithDetails.user = updatedUsersMap.get(app.userId);
        } else if (app.userId && usersMap.has(app.userId)) { // Fallback for already mapped users
          appointmentWithDetails.user = usersMap.get(app.userId);
        }

        // Map consultant details
        if (app.consultantId && updatedConsultantsMap.has(app.consultantId)) {
          appointmentWithDetails.consultant = updatedConsultantsMap.get(app.consultantId);
        } else if (app.consultantId && consultantsMap.has(app.consultantId)) { // Fallback for already mapped consultants
          appointmentWithDetails.consultant = consultantsMap.get(app.consultantId);
        }
        return appointmentWithDetails;
      });

      setAppointments(appointmentsWithDetails);
      setTotalAppointments(response.meta.totalItems);
    } catch (err: any) {
      console.error("Error fetching appointments:", err);
      setError(err?.message || "Lỗi khi tải danh sách cuộc hẹn.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [currentPage, filterStatus, filterConsultantId, filterUserId]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleUpdateStatus = async (id: string, newStatus: UpdateAppointmentDto["status"]) => {
    try {
      await AppointmentService.updateAppointmentStatus(id, { status: newStatus });
      toast({
        title: "Thành công",
        description: `Trạng thái cuộc hẹn đã được cập nhật thành ${AppointmentService.getStatusText(newStatus as Appointment["status"])}`,
      });
      fetchAppointments();
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: `Không thể cập nhật trạng thái cuộc hẹn: ${err.message}`,
        variant: "destructive",
      });
    }
  };

  const handleCancelAppointment = async (id: string, reason: string = "Hủy bởi quản trị viên") => {
    try {
      const data: CancelAppointmentDto = { cancellationReason: reason };
      await AppointmentService.cancelAppointment(id, data);
      toast({
        title: "Thành công",
        description: "Cuộc hẹn đã được hủy.",
      });
      fetchAppointments();
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: `Không thể hủy cuộc hẹn: ${err.message}`,
        variant: "destructive",
      });
    }
  };

  const totalPages = Math.ceil(totalAppointments / limit);

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

  const handleViewAppointmentDetailsClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsViewAppointmentDetailDialogOpen(true);
  };

  const handleCloseViewAppointmentDetailDialog = () => {
    setIsViewAppointmentDetailDialogOpen(false);
    setSelectedAppointment(null);
  };

  const handleAddAppointmentClick = () => {
    setIsAddAppointmentDialogOpen(true);
  };

  const handleCloseAddAppointmentDialog = () => {
    setIsAddAppointmentDialogOpen(false);
  };

  const handleAppointmentAdded = () => {
    setIsAddAppointmentDialogOpen(false);
    fetchAppointments(); // Refresh appointment list
    toast({
      title: "Thành công",
      description: "Cuộc hẹn mới đã được thêm.",
    });
  };

  const handleJoinChat = async (appointment: Appointment) => {
    try {
      const chatRoom: ChatRoom = await ChatService.getChatRoomByAppointmentId(appointment.id);

      // If appointment has no notes or empty notes, send a default message
      if (!appointment.notes || appointment.notes.trim() === "") {
        await ChatService.sendAppointmentMessage(chatRoom.id, { content: "Chào bạn" }); // Changed to sendAppointmentMessage
      }

      router.push(`/chat/${chatRoom.id}`);
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: `Không thể vào phòng chat: ${err.message || "Đã xảy ra lỗi không xác định."}`,
        variant: "destructive",
      });
      console.error("Error getting chat room or sending initial message:", err);
    }
  };

  const getLocationText = (location: string | undefined): string => {
    if (!location) {
      return "Địa điểm không xác định";
    }
    switch (location) {
      case "online":
        return "Trực tuyến";
      case "office":
        return "Tại phòng khám";
      default:
        return location; // Trả về nguyên văn nếu không khớp
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <Input
            placeholder="Tìm kiếm khách hàng/tư vấn viên..."
            className="w-[250px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="pending">Chờ xác nhận</SelectItem>
              <SelectItem value="confirmed">Đã xác nhận</SelectItem>
              <SelectItem value="checked_in">Đã check-in</SelectItem>
              <SelectItem value="in_progress">Đang tiến hành</SelectItem>
              <SelectItem value="completed">Hoàn thành</SelectItem>
              <SelectItem value="cancelled">Đã hủy</SelectItem>
              <SelectItem value="no_show">Không có mặt</SelectItem>
            </SelectContent>
          </Select>
          {/* Add Select for Consultant and User if you have a list of them */}
          {/* <Select value={filterConsultantId} onValueChange={setFilterConsultantId}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo tư vấn viên" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả tư vấn viên</SelectItem>
              {/* Map actual consultants here }
            </SelectContent>
          </Select>
          <Select value={filterUserId} onValueChange={setFilterUserId}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo khách hàng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả khách hàng</SelectItem>
              {/* Map actual users here }
            </SelectContent>
          </Select> */}
        </div>
        <Button onClick={handleAddAppointmentClick}>Thêm cuộc hẹn mới</Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Đang tải cuộc hẹn...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Không có cuộc hẹn nào.</div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã cuộc hẹn</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Tư vấn viên</TableHead>
                <TableHead>Dịch vụ</TableHead>
                <TableHead>Ngày giờ</TableHead>
                <TableHead>Địa điểm</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>{appointment.id.substring(0, 8)}...</TableCell>
                  <TableCell>
                    {appointment.user ? `${appointment.user.firstName} ${appointment.user.lastName}` : "N/A"}
                  </TableCell>
                  <TableCell>{appointment.consultant?.firstName} {appointment.consultant?.lastName || "N/A"}</TableCell>
                  <TableCell>{appointment.service?.name || "Tư vấn trực tuyến"}</TableCell>
                  <TableCell>
                    {format(new Date(appointment.appointmentDate), "dd/MM/yyyy HH:mm")}
                  </TableCell>
                  <TableCell>{getLocationText(appointment.appointmentLocation)}</TableCell>
                  <TableCell>
                    <Badge variant={appointment.status === "completed" ? "default" : "secondary"}>
                      {AppointmentService.getStatusText(appointment.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleViewAppointmentDetailsClick(appointment)}>
                        Chi tiết
                      </Button>
                      {appointment.status === "confirmed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(appointment.id, "checked_in")}
                        >
                          Check-in
                        </Button>
                      )}
                      {AppointmentService.canCancel(appointment.status) && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancelAppointment(appointment.id)}
                        >
                          Hủy
                        </Button>
                      )}
                      {["confirmed", "in_progress", "completed"].includes(
                        appointment.status
                      ) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleJoinChat(appointment)}
                          className="flex items-center gap-2"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Vào chat
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-between items-center mt-4">
            <PaginationInfo
              totalItems={totalAppointments}
              itemsPerPage={limit}
              currentPage={currentPage}
              itemName="cuộc hẹn"
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

      {/* Add Appointment Dialog */}
      <Dialog open={isAddAppointmentDialogOpen} onOpenChange={setIsAddAppointmentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Thêm cuộc hẹn mới</DialogTitle>
            <DialogDescription>
              Điền thông tin để tạo cuộc hẹn mới.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="userId" className="text-right">
                ID Khách hàng
              </Label>
              <Input id="userId" defaultValue="" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="consultantId" className="text-right">
                ID Tư vấn viên
              </Label>
              <Input id="consultantId" defaultValue="" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="serviceId" className="text-right">
                ID Dịch vụ
              </Label>
              <Input id="serviceId" defaultValue="" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="appointmentDate" className="text-right">
                Ngày giờ
              </Label>
              <Input id="appointmentDate" type="datetime-local" defaultValue="" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Địa điểm
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn địa điểm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Trực tuyến</SelectItem>
                  <SelectItem value="office">Tại phòng khám</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Ghi chú
              </Label>
              <Input id="notes" defaultValue="" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseAddAppointmentDialog}>Hủy</Button>
            <Button onClick={handleAppointmentAdded}>Thêm cuộc hẹn</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Appointment Detail Dialog */}
      <Dialog open={isViewAppointmentDetailDialogOpen} onOpenChange={setIsViewAppointmentDetailDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chi tiết cuộc hẹn</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết của cuộc hẹn.
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">ID:</Label>
                <span className="col-span-3">{selectedAppointment.id}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Khách hàng:</Label>
                <span className="col-span-3">{selectedAppointment.user ? `${selectedAppointment.user.firstName} ${selectedAppointment.user.lastName}` : "N/A"}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Tư vấn viên:</Label>
                <span className="col-span-3">{selectedAppointment.consultant?.user?.firstName} {selectedAppointment.consultant?.user?.lastName || "N/A"}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Dịch vụ:</Label>
                <span className="col-span-3">{selectedAppointment.service?.name || "Tư vấn chung"}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Ngày giờ:</Label>
                <span className="col-span-3">{format(new Date(selectedAppointment.appointmentDate), "dd/MM/yyyy HH:mm")}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Địa điểm:</Label>
                <span className="col-span-3">{getLocationText(selectedAppointment.appointmentLocation)}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Trạng thái:</Label>
                <span className="col-span-3">
                  <Badge variant={selectedAppointment.status === "completed" ? "default" : "secondary"}>
                    {AppointmentService.getStatusText(selectedAppointment.status)}
                  </Badge>
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Ghi chú:</Label>
                <span className="col-span-3">{selectedAppointment.notes || "N/A"}</span>
              </div>
              {selectedAppointment.meetingLink && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Link cuộc họp:</Label>
                  <a href={selectedAppointment.meetingLink} target="_blank" rel="noopener noreferrer" className="col-span-3 text-blue-500 hover:underline">
                    {selectedAppointment.meetingLink}
                  </a>
                </div>
              )}
              {selectedAppointment.cancellationReason && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Lý do hủy:</Label>
                  <span className="col-span-3">{selectedAppointment.cancellationReason}</span>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleCloseViewAppointmentDetailDialog}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
