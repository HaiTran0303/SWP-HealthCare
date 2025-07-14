"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { apiClient } from "@/services/api";
import { API_ENDPOINTS } from "@/config/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "checked_in",
  "in_progress",
  "completed",
  "cancelled",
  "rescheduled",
  "no_show",
];

export default function AppointmentManagementTable() {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [meetingLinks, setMeetingLinks] = useState<{ [id: string]: string }>(
    {}
  );

  // Bộ lọc
  const [consultantId, setConsultantId] = useState("all");
  const [status, setStatus] = useState("pending");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [consultants, setConsultants] = useState<any[]>([]);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<
    "checkin" | "late" | "noshow" | null
  >(null);
  const [selectedApt, setSelectedApt] = useState<any>(null);
  // Dialog form state
  const [checkInTime, setCheckInTime] = useState("");
  const [actualArrivalTime, setActualArrivalTime] = useState("");
  const [notes, setNotes] = useState("");
  const [reason, setReason] = useState("");
  const [contactAttempts, setContactAttempts] = useState(1);

  // Lấy danh sách tư vấn viên cho filter
  useEffect(() => {
    const fetchConsultants = async () => {
      try {
        const accessToken =
          typeof window !== "undefined"
            ? localStorage.getItem("accessToken")
            : null;
        const data = await apiClient.get<any>(
          `${API_ENDPOINTS.CONSULTANTS.BASE}?status=active`,
          {
            headers: accessToken
              ? { Authorization: `Bearer ${accessToken}` }
              : {},
          }
        );
        setConsultants(data.data || []);
      } catch {
        setConsultants([]);
      }
    };
    fetchConsultants();
  }, []);

  // Fetch appointments from API
  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const accessToken =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;
      const params = new URLSearchParams();
      params.append("sortBy", "appointmentDate");
      params.append("sortOrder", "DESC");
      if (consultantId && consultantId !== "all" && consultantId !== "none")
        params.append("consultantId", consultantId);
      if (status && status !== "all") params.append("status", status);
      if (fromDate) params.append("fromDate", fromDate);
      if (toDate) params.append("toDate", toDate);
      const data = await apiClient.get<any>(
        `${API_ENDPOINTS.APPOINTMENTS.BASE}?${params.toString()}`,
        {
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : {},
        }
      );
      setAppointments(data.data || []);
    } catch (err: any) {
      setError(err.message || "Lỗi khi tải danh sách lịch hẹn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consultantId, status, fromDate, toDate]);

  useEffect(() => {
    console.log("Appointments:", appointments);
    console.log("Consultants:", consultants);
  }, [appointments, consultants]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setLoadingId(id);
    try {
      const accessToken =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;
      const apt = appointments.find((a) => a.id === id);
      const isOnline = apt?.appointmentLocation === "online";
      const meetingLink = isOnline
        ? meetingLinks[id] || apt?.meetingLink || ""
        : "";
      await apiClient.patch(
        API_ENDPOINTS.APPOINTMENTS.STATUS(id),
        { status: newStatus, meetingLink },
        {
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : {},
        }
      );
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === id ? { ...apt, status: newStatus, meetingLink } : apt
        )
      );
      toast({ title: "Thành công", description: "Đã cập nhật trạng thái." });
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: err.message || "Cập nhật thất bại",
        variant: "destructive",
      });
    } finally {
      setLoadingId(null);
    }
  };

  // Thêm hàm gửi meetingLink riêng
  const handleSendMeetingLink = async (id: string) => {
    setLoadingId(id);
    try {
      const accessToken =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;
      const apt = appointments.find((a) => a.id === id);
      const meetingLink = meetingLinks[id] || apt?.meetingLink || "";
      await apiClient.patch(
        API_ENDPOINTS.APPOINTMENTS.STATUS(id),
        { status: apt.status, meetingLink },
        {
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : {},
        }
      );
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === id ? { ...apt, meetingLink } : apt))
      );
      toast({ title: "Thành công", description: "Đã gửi link phòng họp." });
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: err.message || "Gửi link thất bại",
        variant: "destructive",
      });
    } finally {
      setLoadingId(null);
    }
  };

  // Reset dialog form state
  const resetDialog = () => {
    setCheckInTime("");
    setActualArrivalTime("");
    setNotes("");
    setReason("");
    setContactAttempts(1);
  };

  // Open dialog
  const openDialog = (type: "checkin" | "late" | "noshow", apt: any) => {
    setDialogType(type);
    setSelectedApt(apt);
    resetDialog();
    if (type === "checkin")
      setCheckInTime(new Date().toISOString().slice(0, 19));
    if (type === "late")
      setActualArrivalTime(new Date().toISOString().slice(0, 19));
    setDialogOpen(true);
  };

  // Gửi API tương ứng
  const handleDialogSubmit = async () => {
    if (!selectedApt || !dialogType) return;
    setLoadingId(selectedApt.id);
    try {
      const accessToken =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;
      let url = "";
      let body: any = {};
      if (dialogType === "checkin") {
        url = `${API_ENDPOINTS.APPOINTMENTS.BASE}/${selectedApt.id}/check-in`;
        body = { checkInTime, notes };
      } else if (dialogType === "late") {
        url = `${API_ENDPOINTS.APPOINTMENTS.BASE}/${selectedApt.id}/late-check-in`;
        body = { actualArrivalTime, notes };
      } else if (dialogType === "noshow") {
        url = `${API_ENDPOINTS.APPOINTMENTS.BASE}/${selectedApt.id}/mark-no-show`;
        body = { reason, contactAttempts, notes };
      }
      await apiClient.post(url, body, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      toast({ title: "Thành công", description: "Đã cập nhật lịch hẹn." });
      setDialogOpen(false);
      // Optionally reload appointments
      fetchAppointments();
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: err.message || "Cập nhật thất bại",
        variant: "destructive",
      });
    } finally {
      setLoadingId(null);
    }
  };

  // Filter appointments theo tư vấn viên nếu cần (so sánh với id user)
  const filteredAppointments =
    consultantId === "all"
      ? appointments
      : consultantId === "none"
        ? appointments.filter((apt) => !apt.consultant)
        : appointments.filter(
            (apt) => apt.consultant && apt.consultant.id === consultantId
          );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Quản lý lịch hẹn</h1>
      <Card className="mb-4">
        <CardContent className="flex flex-wrap gap-4 pt-6 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">
              Tư vấn viên
            </label>
            <Select value={consultantId} onValueChange={setConsultantId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Chọn tư vấn viên" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="none">Chưa có tư vấn viên</SelectItem>
                {consultants.map((c) => (
                  <SelectItem key={c.user.id} value={c.user.id}>
                    {c.user.firstName} {c.user.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Trạng thái</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Từ ngày</label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-[160px]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Đến ngày</label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-[160px]"
            />
          </div>
          <Button variant="outline" onClick={fetchAppointments} type="button">
            Làm mới
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Danh sách lịch hẹn</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Đang tải danh sách lịch hẹn...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Tư vấn viên</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Cập nhật trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((apt) => (
                  <TableRow key={apt.id}>
                    <TableCell>{apt.id.slice(0, 8)}</TableCell>
                    <TableCell>
                      {apt.user
                        ? `${apt.user.firstName} ${apt.user.lastName}`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {apt.consultant
                        ? `${apt.consultant.firstName} ${apt.consultant.lastName}`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {apt.appointmentDate
                        ? new Date(apt.appointmentDate).toLocaleString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge>{apt.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {["no_show", "cancelled", "completed"].includes(
                        apt.status
                      ) ? (
                        <span>-</span>
                      ) : (
                        <Select
                          value={apt.status}
                          onValueChange={(value) =>
                            handleStatusChange(apt.id, value)
                          }
                          disabled={loadingId === apt.id}
                        >
                          <SelectTrigger
                            className="w-[150px]"
                            disabled={loadingId === apt.id}
                          >
                            <SelectValue placeholder="Chọn trạng thái" />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {/* Nếu là online, hiển thị ô nhập meetingLink */}
                      {apt.appointmentLocation === "online" &&
                        !["no_show", "cancelled", "completed"].includes(
                          apt.status
                        ) && (
                          <div className="flex gap-2 mt-2">
                            <Input
                              placeholder="Nhập link phòng họp..."
                              value={
                                meetingLinks[apt.id] ?? apt.meetingLink ?? ""
                              }
                              onChange={(e) =>
                                setMeetingLinks((prev) => ({
                                  ...prev,
                                  [apt.id]: e.target.value,
                                }))
                              }
                              disabled={
                                loadingId === apt.id ||
                                ![
                                  "confirmed",
                                  "in_progress",
                                  "completed",
                                ].includes(apt.status)
                              }
                            />
                            <Button
                              variant="secondary"
                              size="sm"
                              disabled={
                                loadingId === apt.id ||
                                ![
                                  "confirmed",
                                  "in_progress",
                                  "completed",
                                ].includes(apt.status) ||
                                !(meetingLinks[apt.id] ?? apt.meetingLink ?? "")
                              }
                              onClick={() => handleSendMeetingLink(apt.id)}
                            >
                              Gửi link
                            </Button>
                          </div>
                        )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDialog("checkin", apt)}
                        >
                          Check-in
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDialog("late", apt)}
                        >
                          Check-in trễ
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openDialog("noshow", apt)}
                        >
                          No-show
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      {/* Dialog thao tác đặc biệt */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogType === "checkin" && "Check-in bệnh nhân"}
              {dialogType === "late" && "Check-in trễ"}
              {dialogType === "noshow" && "Đánh dấu No-show"}
            </DialogTitle>
          </DialogHeader>
          {dialogType === "checkin" && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Thời gian check-in
                </label>
                <Input
                  type="datetime-local"
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Ghi chú
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          )}
          {dialogType === "late" && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Thời gian đến thực tế
                </label>
                <Input
                  type="datetime-local"
                  value={actualArrivalTime}
                  onChange={(e) => setActualArrivalTime(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Ghi chú
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          )}
          {dialogType === "noshow" && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Lý do</label>
                <Input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Số lần liên hệ
                </label>
                <Input
                  type="number"
                  min={1}
                  value={contactAttempts}
                  onChange={(e) => setContactAttempts(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Ghi chú
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={handleDialogSubmit}
              disabled={loadingId === selectedApt?.id}
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
