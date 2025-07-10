"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const STATUS_OPTIONS = [
  { value: "pending", label: "Chờ xác nhận" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "checked_in", label: "Đã check-in" },
  { value: "in_progress", label: "Đang diễn ra" },
  { value: "completed", label: "Hoàn thành" },
  { value: "cancelled", label: "Đã hủy" },
  { value: "rescheduled", label: "Đã dời lịch" },
  { value: "no_show", label: "Không đến" },
];

export default function UpdateAppointmentStatusPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!status) {
      setError("Vui lòng chọn trạng thái mới.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `https://gender-healthcare.org/appointments/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status, meetingLink }),
        }
      );
      const data = await res.json();
      if (data.success) {
        toast({ title: "Thành công", description: "Đã cập nhật trạng thái." });
        setTimeout(() => {
          router.push("/profile/appointments");
        }, 1200);
      } else {
        setError(data.message || "Không thể cập nhật trạng thái.");
      }
    } catch (e) {
      setError("Không thể cập nhật trạng thái.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Cập nhật trạng thái cuộc hẹn</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-medium mb-2">Trạng thái mới</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
          >
            <option value="">Chọn trạng thái</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        {(status === "confirmed" || status === "in_progress") && (
          <div>
            <label className="block font-medium mb-2">
              Link phòng họp (nếu có)
            </label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="https://..."
            />
          </div>
        )}
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Đang cập nhật..." : "Cập nhật"}
        </Button>
      </form>
    </div>
  );
}
