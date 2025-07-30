"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface EnterChatIdDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onEnterChat: (questionId: string) => void;
}

export const EnterChatIdDialog: React.FC<EnterChatIdDialogProps> = ({
  isOpen,
  onClose,
  onEnterChat,
}) => {
  const [questionId, setQuestionId] = useState("");
  const { toast } = useToast();

  const handleEnter = () => {
    if (!questionId.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập ID phòng chat.",
        variant: "destructive",
      });
      return;
    }
    onEnterChat(questionId.trim());
    onClose();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleEnter();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nhập ID phòng chat</DialogTitle>
          <DialogDescription>
            Vui lòng nhập ID phòng chat mà khách hàng đã cung cấp.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="questionId" className="text-right">
              ID phòng chat
            </Label>
            <Input
              id="questionId"
              value={questionId}
              onChange={(e) => setQuestionId(e.target.value)}
              className="col-span-3"
              onKeyDown={handleKeyDown}
              tabIndex={0}
              aria-label="ID phòng chat"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleEnter}
            tabIndex={0}
            aria-label="Vào phòng chat"
          >
            Vào phòng chat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
