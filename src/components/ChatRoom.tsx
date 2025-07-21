"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Send, Paperclip, XCircle, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  ChatService,
  ChatMessage,
  ChatQuestion,
  initializeSocket,
} from "@/services/chat.service";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface ChatRoomProps {
  questionId: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ questionId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [question, setQuestion] = useState<ChatQuestion | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchQuestionAndMessages = useCallback(async (retriesRemaining = 3) => {
    setIsLoading(true); // Always show loading initially
    try {
      const [questionResponse, messagesResponse] = await Promise.all([
        ChatService.getQuestionById(questionId),
        ChatService.getMessages(questionId),
      ]);
      setQuestion(questionResponse);
      setMessages(messagesResponse.data.reverse()); // Reverse for chronological order
      await ChatService.markAllMessagesAsRead(questionId);
      setIsLoading(false); // Only set false on success
    } catch (error: any) {
      console.error("Error fetching chat data:", error);
      if (error.response?.status === 404 && retriesRemaining > 0) {
        console.log(`Retrying fetch for questionId ${questionId}, retries left: ${retriesRemaining}`);
        // Use a promise to delay and then re-call, but don't set isLoading to false yet
        setTimeout(() => fetchQuestionAndMessages(retriesRemaining - 1), 1000);
      } else {
        // No more retries or it's not a 404, so show error and stop loading
        toast({
          title: "Lỗi",
          description: error.response?.status === 404 ? "Không tìm thấy phòng chat. Vui lòng thử lại sau." : "Không thể tải dữ liệu chat. Vui lòng thử lại.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    }
  }, [questionId, toast]); // Dependencies: questionId, toast

  useEffect(() => {
    if (!questionId) {
      // If questionId is not available, do not proceed with fetching or socket setup
      setIsLoading(false);
      return;
    }

    // Call fetchQuestionAndMessages without retriesRemaining as it's handled internally
    fetchQuestionAndMessages();

    const socket = initializeSocket();

    const cleanupNewMessage = ChatService.onNewMessage((message) => {
      if (message.questionId === questionId) {
        setMessages((prevMessages) => {
          // Prevent duplicate messages if already received via REST API
          if (prevMessages.some((msg) => msg.id === message.id)) {
            return prevMessages;
          }
          return [...prevMessages, message];
        });
        if (message.senderId !== user?.id) {
          ChatService.markMessageAsReadRealtime(questionId, message.id);
        }
      }
    });

    const cleanupTypingStatus = ChatService.onTypingStatus((data) => {
      if (data.questionId === questionId && data.userId !== user?.id) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          if (data.isTyping) {
            newSet.add(data.userName);
          } else {
            newSet.delete(data.userName);
          }
          return newSet;
        });
      }
    });

    const cleanupMessageRead = ChatService.onMessageRead((data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId ? { ...msg, isRead: true } : msg
        )
      );
    });

    // Join the question room when component mounts
    ChatService.joinQuestion(questionId).catch(console.error);

    return () => {
      cleanupNewMessage();
      cleanupTypingStatus();
      cleanupMessageRead();
      ChatService.leaveQuestion(questionId).catch(console.error);
      socket.disconnect(); // Disconnect socket when component unmounts
    };
  }, [fetchQuestionAndMessages, questionId, user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const sentMessage = await ChatService.sendMessage(questionId, {
        content: newMessage,
        type: "text",
      });
      setMessages((prevMessages) => {
        // Avoid duplicates if the message was already added by the socket listener (less likely for self-sent)
        if (prevMessages.some((msg) => msg.id === sentMessage.id)) {
          return prevMessages;
        }
        return [...prevMessages, sentMessage];
      });
      setNewMessage("");
      ChatService.setTyping(questionId, false); // Stop typing after sending
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Lỗi",
        description: "Không thể gửi tin nhắn. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    } else {
      ChatService.handleTyping(questionId);
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", file.type.startsWith("image/") ? "image" : "file"); // Determine type

    setIsSending(true);
    try {
      const sentFileMessage = await ChatService.sendFile(questionId, formData);
      setMessages((prevMessages) => {
        // Avoid duplicates if the message was already added by the socket listener (less likely for self-sent)
        if (prevMessages.some((msg) => msg.id === sentFileMessage.id)) {
          return prevMessages;
        }
        return [...prevMessages, sentFileMessage];
      });
      toast({
        title: "Thành công",
        description: "Tệp đã được gửi.",
      });
    } catch (error) {
      console.error("Error sending file:", error);
      toast({
        title: "Lỗi",
        description: "Không thể gửi tệp. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Clear file input
      }
    }
  };

  const handleDownloadFile = async (messageId: string, filename: string) => {
    try {
      const response = await ChatService.downloadFile(messageId);
      if (response.fileUrl) {
        // Create a temporary link and click it to trigger download
        const link = document.createElement("a");
        link.href = response.fileUrl;
        link.download = filename; // Suggest filename
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        toast({
          title: "Lỗi",
          description: "Không tìm thấy URL tệp để tải xuống.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải xuống tệp. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Không tìm thấy phòng chat.</p>
      </div>
    );
  }

  const getSenderName = (message: ChatMessage) => {
    if (message.senderId === user?.id) {
      return "Bạn";
    }
    return message.senderName || "Người dùng";
  };

  const getSenderAvatar = (message: ChatMessage) => {
    if (message.senderId === user?.id) {
      return user?.profilePicture || "";
    }
    // TODO: Implement logic to get consultant's avatar
    return "";
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="flex flex-col h-[80vh]">
        <CardHeader className="border-b">
          <CardTitle className="text-2xl flex items-center justify-between">
            <span>{question.title}</span>
            <Badge className="ml-2">
              {question.status === "pending" && "Đang chờ"}
              {question.status === "answered" && "Đã trả lời"}
              {question.status === "closed" && "Đã đóng"}
            </Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {question.content}
            {question.isAnonymous && (
              <span className="ml-2 text-xs">(Ẩn danh)</span>
            )}
          </p>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-4">
          <ScrollArea className="h-full pr-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 mb-4 ${
                  message.senderId === user?.id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {message.senderId !== user?.id && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={getSenderAvatar(message)}
                      alt={getSenderName(message)}
                    />
                    <AvatarFallback>
                      {getSenderName(message).charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`flex flex-col max-w-[70%] ${
                    message.senderId === user?.id ? "items-end" : "items-start"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">
                      {getSenderName(message)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(message.createdAt), "HH:mm dd/MM", {
                        locale: vi,
                      })}
                    </span>
                  </div>
                  {message.type === "text" && (
                    <div
                      className={`p-3 rounded-lg ${
                        message.senderId === user?.id
                          ? "bg-blue-500 text-white"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm break-words">{message.content}</p>
                    </div>
                  )}
                  {message.type === "image" && (
                    <div className="relative group">
                      <img
                        src={message.fileUrl}
                        alt="Image message"
                        className="max-w-xs max-h-48 rounded-lg object-contain cursor-pointer"
                        onClick={() => window.open(message.fileUrl, "_blank")}
                      />
                      {message.isRead && message.senderId === user?.id && (
                        <span className="absolute bottom-1 right-1 text-xs text-gray-200">Đã xem</span>
                      )}
                    </div>
                  )}
                  {message.type === "file" && (
                    <div className="p-3 rounded-lg bg-muted flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-muted-foreground" />
                      <Link
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handleDownloadFile(
                            message.id,
                            message.content || "downloaded_file"
                          );
                        }}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {message.content || "Tệp đính kèm"}
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleDownloadFile(
                            message.id,
                            message.content || "downloaded_file"
                          )
                        }
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  {message.senderId === user?.id && (
                    <span className="text-xs text-muted-foreground mt-1">
                      {message.isRead ? "Đã xem" : "Đã gửi"}
                    </span>
                  )}
                </div>
                {message.senderId === user?.id && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={getSenderAvatar(message)}
                      alt={getSenderName(message)}
                    />
                    <AvatarFallback>
                      {getSenderName(message).charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </ScrollArea>
        </CardContent>
        <CardFooter className="border-t p-4 flex flex-col">
          {typingUsers.size > 0 && (
            <div className="w-full text-sm text-muted-foreground mb-2">
              {Array.from(typingUsers).join(", ")} đang nhập...
            </div>
          )}
          <div className="flex w-full items-center gap-2">
            <Input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSending}
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            <Textarea
              placeholder="Nhập tin nhắn..."
              className="flex-1 resize-none"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={isSending}
            />
            <Button onClick={handleSendMessage} disabled={isSending}>
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ChatRoom;
