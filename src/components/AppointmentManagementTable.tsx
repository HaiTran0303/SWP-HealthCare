"use client";

import { useState, useEffect } from "react";
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
  Appointment,
  AppointmentService,
  GetAppointmentsQuery,
  AppointmentStatus,
  UpdateAppointmentDto,
  CancelAppointmentDto,
} from "@/services/appointment.service";
import { API_FEATURES } from "@/config/api";
import { Pagination } from "@/components/ui/pagination";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns"; // For date formatting

export default function AppointmentManagementTable() {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(API_FEATURES.PAGINATION.DEFAULT_PAGE);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [searchQuery, setSearchQuery] = useState(""); // For searching by customer/consultant name/email
  const [filterStatus, setFilterStatus] = useState<string>(""); // For filtering by appointment status
  const [filterConsultantId, setFilterConsultantId] = useState<string>(""); // For filtering by consultant
  const [filterUserId, setFilterUserId] = useState<string>(""); // For filtering by user/customer

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
        query.status = filterStatus;
      }
      if (filterConsultantId) {
        query.consultantId = filterConsultantId;
      }
      if (filterUserId) {
        query.userId = filterUserId;
      }
      // Note: Backend API for appointments doesn't directly support search by name/email in a single query param.
      // For `searchQuery`, you might need to fetch all, then filter client-side, or add specific backend endpoints.
      // For now, `searchQuery` will not be directly applied as a filter to the API call.

      const response = await AppointmentService.getAllAppointments(query);
      setAppointments(response.data);
      setTotalAppointments(response.total);
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
        description: `Trạng thái cuộc hẹn đã được cập nhật thành ${AppointmentService.getStatusText(newStatus)}`,
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
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

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
              <SelectItem value="">Tất cả trạng thái</SelectItem>
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
              <SelectItem value="">Tất cả tư vấn viên</SelectItem>
              {/* Map actual consultants here }
            </SelectContent>
          </Select>
          <Select value={filterUserId} onValueChange={setFilterUserId}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo khách hàng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tất cả khách hàng</SelectItem>
              {/* Map actual users here }
            </SelectContent>
          </Select> */}
        </div>
        <Button>Thêm cuộc hẹn mới</Button>
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
                  <TableCell>{appointment.userId || "N/A"}</TableCell> {/* Need to fetch user details */}
                  <TableCell>{appointment.consultant?.firstName} {appointment.consultant?.lastName || "N/A"}</TableCell>
                  <TableCell>{appointment.service?.name || "Tư vấn chung"}</TableCell>
                  <TableCell>
                    {format(new Date(appointment.appointmentDate), "dd/MM/yyyy HH:mm")}
                  </TableCell>
                  <TableCell>{appointment.location || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant={appointment.status === "completed" ? "default" : "secondary"}>
                      {AppointmentService.getStatusText(appointment.status as AppointmentStatus)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        Chi tiết
                      </Button>
                      {appointment.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(appointment.id, "confirmed")}
                        >
                          Xác nhận
                        </Button>
                      )}
                      {appointment.status === "confirmed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(appointment.id, "checked_in")}
                        >
                          Check-in
                        </Button>
                      )}
                      {AppointmentService.canCancel(appointment.status as AppointmentStatus) && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancelAppointment(appointment.id)}
                        >
                          Hủy
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageNumbers={pageNumbers}
            hasNextPage={currentPage < totalPages}
            hasPreviousPage={currentPage > 1}
            onPageChange={handlePageChange}
            onNextPage={handleNextPage}
            onPreviousPage={handlePreviousPage}
            onFirstPage={handleFirstPage}
            onLastPage={handleLastPage}
          />
        </>
      )}
    </div>
  );
}
