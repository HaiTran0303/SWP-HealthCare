"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { AppointmentService } from "@/services/appointment.service";

interface UpdateMeetingLinkDialogProps {
  appointmentId: string;
  currentMeetingLink?: string;
  onMeetingLinkUpdate: () => void;
}

export function UpdateMeetingLinkDialog({
  appointmentId,
  currentMeetingLink,
  onMeetingLinkUpdate,
}: UpdateMeetingLinkDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [meetingLink, setMeetingLink] = useState<string>(currentMeetingLink || "");
  const { toast } = useToast();

  const handleUpdateMeetingLink = async () => {
    if (!meetingLink) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập link cuộc hẹn.",
        variant: "destructive",
      });
      return;
    }

    try {
      await AppointmentService.updateMeetingLink(appointmentId, meetingLink);
      toast({
        title: "Thành công",
        description: "Link cuộc hẹn đã được cập nhật.",
      });
      onMeetingLinkUpdate();
      setIsOpen(false);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description:
          error?.message || "Không thể cập nhật link cuộc hẹn. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Cập nhật link meeting
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cập nhật link cuộc hẹn</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="meeting-link">Link cuộc hẹn</Label>
            <Input
              id="meeting-link"
              placeholder="Nhập link cuộc hẹn"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
            />
          </div>
          <Button onClick={handleUpdateMeetingLink}>Cập nhật</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
