"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ChatService, ChatQuestion } from "@/services/chat.service";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";

const CreateQuestionDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onQuestionCreated: (questionId: string) => void;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>; // Add setIsLoading prop
  router: any; // Add router prop
}> = ({ isOpen, onClose, onQuestionCreated, isLoading, setIsLoading, router }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tiêu đề và nội dung câu hỏi.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true); // Set loading true at the start
    try {
      const response = await ChatService.createQuestion({ title, content });
      const newQuestionId = response.id;
      
      toast({
        title: "Thành công",
        description: "Câu hỏi của bạn đã được tạo.",
      });
      onClose();
      setTitle("");
      setContent("");
      // Add a small delay before redirecting to allow the backend to process
      setTimeout(() => {
        onQuestionCreated(newQuestionId); // Pass the new question ID after closing dialog
      }, 500); // 500ms delay
    } catch (error) {
      console.error("Error creating question:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo câu hỏi. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false); // Set loading false at the end
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo câu hỏi mới</DialogTitle>
          <DialogDescription>
            Đặt câu hỏi của bạn cho chuyên gia tư vấn.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề</Label>
            <Input
              id="title"
              placeholder="Nhập tiêu đề câu hỏi của bạn"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Nội dung</Label>
            <Textarea
              id="content"
              placeholder="Mô tả chi tiết câu hỏi của bạn"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px]"
              disabled={isLoading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button onClick={handleCreate} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang tạo...
              </>
            ) : (
              "Tạo câu hỏi"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const UserChatManagement: React.FC = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [questions, setQuestions] = useState<ChatQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateQuestionDialogOpen, setIsCreateQuestionDialogOpen] =
    useState(false);
  const [isCreatingQuestion, setIsCreatingQuestion] = useState(false); // This state will be passed to dialog

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const response = await ChatService.getQuestions({
        search: searchTerm,
      });
      setQuestions(response.data);
    } catch (error) {
      console.error("Error fetching chat questions:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách câu hỏi. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [searchTerm]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "answered":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleEnterChat = (questionId: string) => {
    router.push(`/chat/${questionId}`);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Hộp thư tư vấn</h1>
        <Button onClick={() => setIsCreateQuestionDialogOpen(true)}>
          Tạo câu hỏi mới
        </Button>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Tìm kiếm tiêu đề..."
          value={searchTerm}
          onChange={handleSearch}
          className="max-w-sm"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <h3 className="text-lg font-semibold mb-2">Chưa có câu hỏi nào</h3>
              <p className="text-muted-foreground text-center mb-4">
                Bạn chưa có câu hỏi tư vấn nào. Hãy tạo một câu hỏi mới!
              </p>
              <Button onClick={() => setIsCreateQuestionDialogOpen(true)}>
                Tạo câu hỏi mới
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell className="font-medium">
                      {question.title}
                      {question.unreadCount && question.unreadCount > 0 ? (
                        <Badge className="ml-2 bg-blue-500 text-white">
                          {question.unreadCount} tin nhắn mới
                        </Badge>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(question.status)}>
                        {question.status === "pending" && "Đang chờ"}
                        {question.status === "answered" && "Đã trả lời"}
                        {question.status === "closed" && "Đã đóng"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(
                        new Date(question.createdAt),
                        "HH:mm dd/MM/yyyy",
                        { locale: vi }
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEnterChat(question.id)}
                      >
                        Vào chat
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CreateQuestionDialog
        isOpen={isCreateQuestionDialogOpen}
        onClose={() => setIsCreateQuestionDialogOpen(false)}
        onQuestionCreated={(newQuestionId) => {
          fetchQuestions(); // Refresh the list
          router.push(`/chat/${newQuestionId}`); // Redirect to the new chat room
        }}
        isLoading={isCreatingQuestion}
        setIsLoading={setIsCreatingQuestion} // Pass the setter
        router={router} // Pass router to the dialog
      />
    </div>
  );
};

export default UserChatManagement;
