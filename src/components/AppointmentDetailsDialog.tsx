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

interface AppointmentDetailsDialogProps {
  appointment: any;
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
          <p><strong>Khách hàng:</strong> {`${appointment.user.firstName} ${appointment.user.lastName}`}</p>
          <p><strong>Thời gian:</strong> {format(new Date(appointment.appointmentDate), "dd/MM/yyyy HH:mm", { locale: vi })}</p>
          <p><strong>Loại tư vấn:</strong> {appointment.services && appointment.services.length > 0 ? appointment.services[0].name : "Tư vấn trực tuyến"}</p>
          <p><strong>Trạng thái:</strong> <Badge>{translatedAppointmentStatus(appointment.status)}</Badge></p>
          <p><strong>Ghi chú:</strong> {appointment.notes}</p>
          {appointment.payment && (
            <div>
              <h4 className="font-semibold mt-4">Chi tiết thanh toán</h4>
              <p><strong>Mã thanh toán:</strong> {appointment.payment.id}</p>
              <p><strong>Số tiền:</strong> {appointment.payment.amount}</p>
              <p><strong>Trạng thái thanh toán:</strong> {appointment.payment.status}</p>
              <p><strong>Phương thức thanh toán:</strong> {appointment.payment.paymentMethod}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
