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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ChatService } from "@/services/chat.service";
import { ApiResponse, CreateQuestionDto, Question } from "@/types/api.d"; // Import ApiResponse and Question
import { useRouter } from "next/navigation";

interface CreateChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string; // Pass appointmentId if needed for context or future backend updates
}

export const CreateChatDialog: React.FC<CreateChatDialogProps> = ({
  isOpen,
  onClose,
  appointmentId,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleCreateChat = async () => {
    setIsLoading(true);
    try {
      if (!title.trim() || !content.trim()) {
        toast({
          title: "Lỗi",
          description: "Vui lòng nhập tiêu đề và nội dung chat.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const chatQuestion: CreateQuestionDto = {
        title: title.trim(),
        content: content.trim(),
      };

      const createdQuestion: ApiResponse<Question> = await ChatService.createQuestion(chatQuestion);
      console.log("[CreateChatDialog] Created Chat Question:", createdQuestion);

      toast({
        title: "Tạo phòng chat thành công!",
        description: "Bạn sẽ được chuyển hướng đến phòng chat.",
        variant: "default",
      });

      onClose(); // Close dialog
      // Redirect to chat room using createdQuestion.data.id, passing title and content as query params
      router.push(`/chat/${createdQuestion.data.id}?title=${encodeURIComponent(title.trim())}&content=${encodeURIComponent(content.trim())}`);
    } catch (error: any) {
      console.error("[CreateChatDialog] Error creating chat question:", error);
      let errorMessage = "Có lỗi xảy ra khi tạo phòng chat. Vui lòng thử lại.";
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      toast({
        title: "Lỗi tạo phòng chat",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleCreateChat();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tạo phòng chat mới</DialogTitle>
          <DialogDescription>
            Nhập tiêu đề và nội dung cho phòng chat của bạn.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Tiêu đề
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              onKeyDown={handleKeyDown}
              tabIndex={0}
              aria-label="Tiêu đề phòng chat"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="content" className="text-right">
              Nội dung
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="col-span-3"
              onKeyDown={handleKeyDown}
              tabIndex={0}
              aria-label="Nội dung chat"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleCreateChat}
            disabled={isLoading}
            tabIndex={0}
            aria-label="Tạo phòng chat"
          >
            {isLoading ? "Đang tạo..." : "Tạo phòng chat"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
