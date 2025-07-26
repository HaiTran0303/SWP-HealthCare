"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { translatedAppointmentStatus } from "@/lib/translations";
import { Appointment } from "@/types/api.d";
import { User } from "@/services/user.service";
import { ConsultantProfile } from "@/services/consultant.service";
import { Service } from "@/services/service.service";

interface AppointmentDetailsDialogProps {
  appointment: Appointment;
}

export function AppointmentDetailsDialog({ appointment }: AppointmentDetailsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          Chi tiết
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chi tiết cuộc hẹn</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p><strong>Mã cuộc hẹn:</strong> {appointment.id.substring(0, 8).toUpperCase()}</p>
          {appointment.user && (
            <p><strong>Khách hàng:</strong> {`${appointment.user.firstName} ${appointment.user.lastName}`}</p>
          )}
          {appointment.consultant?.user && (
            <p><strong>Tư vấn viên:</strong> {`${appointment.consultant.user.firstName} ${appointment.consultant.user.lastName}`}</p>
          )}
          <p><strong>Thời gian:</strong> {format(new Date(appointment.appointmentDate), "dd/MM/yyyy HH:mm", { locale: vi })}</p>
          <p><strong>Loại tư vấn:</strong> {appointment.service?.name || "Tư vấn trực tuyến"}</p>
          <p><strong>Trạng thái:</strong> <Badge>{translatedAppointmentStatus(appointment.status)}</Badge></p>
          <p><strong>Ghi chú:</strong> {appointment.notes}</p>
          {appointment.paymentStatus && (
            <div>
              <h4 className="font-semibold mt-4">Trạng thái thanh toán</h4>
              <p><strong>Trạng thái:</strong> {appointment.paymentStatus}</p>
            </div>
          )}
          {appointment.chatRoomId && (
            <p><strong>ID phòng chat:</strong> {appointment.chatRoomId}</p>
          )}
          {appointment.meetingLink && (
            <p><strong>Link cuộc họp:</strong> <a href={appointment.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{appointment.meetingLink}</a></p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
