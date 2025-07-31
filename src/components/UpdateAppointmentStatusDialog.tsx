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
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { apiClient } from "@/services/api";
import { API_ENDPOINTS } from "@/config/api";
import { appointmentStatusMap } from "@/lib/translations";
import { Appointment } from "@/types/api.d"; // Import Appointment type

interface UpdateAppointmentStatusDialogProps {
  appointmentId: string;
  onStatusUpdate: () => void;
}

const appointmentStatuses: (keyof typeof appointmentStatusMap & Appointment["status"])[] = Object.keys(appointmentStatusMap) as (keyof typeof appointmentStatusMap & Appointment["status"])[];

export function UpdateAppointmentStatusDialog({
  appointmentId,
  onStatusUpdate,
}: UpdateAppointmentStatusDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>(""); // Keep as string for select input
  const { toast } = useToast();

  const handleStatusChange = async () => {
    try {
      await apiClient.patch(
        `${API_ENDPOINTS.APPOINTMENTS.UPDATE_STATUS(appointmentId)}`,
        { status: newStatus as Appointment["status"] }
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
          <div>
            <Label htmlFor="status-select">Trạng thái</Label>
            <Select onValueChange={setNewStatus}>
              <SelectTrigger id="status-select">
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
          </div>
          <Button onClick={handleStatusChange}>Cập nhật</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
