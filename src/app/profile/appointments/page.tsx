"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

const STATUS_LABELS: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  cancelled: "Đã hủy",
  completed: "Hoàn thành",
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString() + " " + d.toLocaleTimeString();
}

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selected, setSelected] = useState<any | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<any | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  // Lấy userId từ localStorage (hoặc context nếu có)
  const userId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  useEffect(() => {
    console.log("userId:", userId, "token:", token);
    if (!userId || !token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    let url = `https://gender-healthcare.org/appointments?userId=${userId}&sortBy=appointmentDate&sortOrder=DESC`;
    if (statusFilter) url += `&status=${statusFilter}`;
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setAppointments(data?.data?.data || []))
      .catch((err) => {
        console.error("Lỗi lấy lịch:", err);
        setAppointments([]);
      })
      .finally(() => setLoading(false));
  }, [userId, token, statusFilter]);

  const handleCancel = async () => {
    if (!selected) return;
    try {
      const res = await fetch(
        `https://gender-healthcare.org/appointments/${selected.id}/cancel`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ cancellationReason: cancelReason }),
        }
      );
      const data = await res.json();
      if (data.success) {
        toast({ title: "Thành công", description: "Đã hủy lịch." });
        setShowCancel(false);
        setCancelReason("");
        setSelected(null);
        // Refresh list
        setLoading(true);
        let url = `https://gender-healthcare.org/appointments?userId=${userId}&sortBy=appointmentDate&sortOrder=DESC`;
        if (statusFilter) url += `&status=${statusFilter}`;
        fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => setAppointments(data?.data?.data || []))
          .catch(() => setAppointments([]))
          .finally(() => setLoading(false));
      } else {
        toast({
          title: "Lỗi",
          description: data.message || "Không thể hủy lịch.",
        });
      }
    } catch (e) {
      toast({ title: "Lỗi", description: "Không thể hủy lịch." });
    }
  };

  const openDetail = async (appt: any) => {
    setShowDetail(true);
    setDetailLoading(true);
    setDetail(null);
    try {
      const res = await fetch(
        `https://gender-healthcare.org/appointments/${appt.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setDetail(data?.data || null);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Lịch tư vấn của tôi</h1>
      <div className="mb-6 flex gap-4 items-center">
        <span>Lọc theo trạng thái:</span>
        <select
          className="border rounded px-2 py-1"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Tất cả</option>
          <option value="pending">Chờ xác nhận</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="completed">Hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>
      {!userId || !token ? (
        <div className="text-center py-10 text-red-500">
          Bạn cần đăng nhập lại để xem lịch tư vấn.
        </div>
      ) : loading ? (
        <div className="text-center py-10">Đang tải...</div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          Không có lịch tư vấn nào.
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <Card
              key={appt.id}
              className="hover:shadow-lg transition cursor-pointer"
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">
                  {appt.services?.[0]?.name || "Dịch vụ"}
                </CardTitle>
                <Badge variant="outline">
                  {STATUS_LABELS[appt.status] || appt.status}
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <div>
                    <span className="font-semibold">Ngày:</span>{" "}
                    {formatDate(appt.appointmentDate)}
                  </div>
                  <div>
                    <span className="font-semibold">Tư vấn viên:</span>{" "}
                    {appt.consultant
                      ? `${appt.consultant.lastName} ${appt.consultant.firstName}`
                      : "-"}
                  </div>
                  <div>
                    <span className="font-semibold">Trạng thái:</span>{" "}
                    {STATUS_LABELS[appt.status] || appt.status}
                  </div>
                </div>
                <div className="flex gap-2 mt-2 md:mt-0">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelected(appt);
                      openDetail(appt);
                    }}
                  >
                    Chi tiết
                  </Button>
                  {appt.status === "pending" && (
                    <>
                      <Button
                        variant="default"
                        onClick={() =>
                          router.push(`/appointments/payment/${appt.id}`)
                        }
                      >
                        Thanh toán
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          setSelected(appt);
                          setShowCancel(true);
                        }}
                      >
                        Hủy
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {/* Dialog chi tiết */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chi tiết lịch tư vấn</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div>Đang tải chi tiết...</div>
          ) : detail ? (
            <div className="space-y-2">
              <div>
                <span className="font-semibold">Dịch vụ:</span>{" "}
                {detail.services?.[0]?.name}
              </div>
              <div>
                <span className="font-semibold">Ngày:</span>{" "}
                {formatDate(detail.appointmentDate)}
              </div>
              <div>
                <span className="font-semibold">Tư vấn viên:</span>{" "}
                {detail.consultant
                  ? `${detail.consultant.lastName} ${detail.consultant.firstName}`
                  : "-"}
              </div>
              <div>
                <span className="font-semibold">Trạng thái:</span>{" "}
                {STATUS_LABELS[detail.status] || detail.status}
              </div>
              <div>
                <span className="font-semibold">Ghi chú:</span>{" "}
                {detail.notes || "-"}
              </div>
              <div>
                <span className="font-semibold">Nơi chốn:</span>{" "}
                {detail.appointmentLocation === "online"
                  ? "Online"
                  : "Tại cơ sở"}
              </div>
              <div>
                <span className="font-semibold">Link tham gia:</span>{" "}
                {detail.meetingLink ? (
                  <a
                    href={
                      detail.meetingLink.startsWith("http://") ||
                      detail.meetingLink.startsWith("https://")
                        ? detail.meetingLink
                        : `https://${detail.meetingLink}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#1976d2", textDecoration: "underline" }}
                  >
                    {detail.meetingLink}
                  </a>
                ) : (
                  "-"
                )}
              </div>
            </div>
          ) : (
            <div>Không tìm thấy chi tiết lịch.</div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowDetail(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Dialog hủy lịch */}
      <Dialog open={showCancel} onOpenChange={setShowCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hủy lịch tư vấn</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <div>Bạn chắc chắn muốn hủy lịch này?</div>
            <Textarea
              placeholder="Lý do hủy (bắt buộc)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancel(false)}>
              Bỏ qua
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={!cancelReason}
            >
              Xác nhận hủy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
