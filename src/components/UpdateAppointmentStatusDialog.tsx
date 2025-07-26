"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { apiClient } from "@/services/api";
import { API_ENDPOINTS } from "@/config/api";
import { appointmentStatusMap } from "@/lib/translations";

interface UpdateAppointmentStatusDialogProps {
  appointmentId: string;
  onStatusUpdate: () => void;
}

const appointmentStatuses = Object.keys(appointmentStatusMap);

export function UpdateAppointmentStatusDialog({
  appointmentId,
  onStatusUpdate,
}: UpdateAppointmentStatusDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const { toast } = useToast();

  const handleStatusChange = async () => {
    if (!newStatus) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn một trạng thái mới.",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiClient.patch(
        `${API_ENDPOINTS.APPOINTMENTS.UPDATE_STATUS(appointmentId)}`,
        { status: newStatus }
      );
      toast({
        title: "Thành công",
        description: "Trạng thái cuộc hẹn đã được cập nhật.",
      });
      onStatusUpdate();
      setIsOpen(false);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description:
          error?.message || "Không thể cập nhật trạng thái. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          Cập nhật trạng thái
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cập nhật trạng thái cuộc hẹn</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Select onValueChange={setNewStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn trạng thái mới" />
            </SelectTrigger>
            <SelectContent>
              {appointmentStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {appointmentStatusMap[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleStatusChange}>Cập nhật</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
