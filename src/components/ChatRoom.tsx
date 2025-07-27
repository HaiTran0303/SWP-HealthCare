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
  initializeSocket,
} from "@/services/chat.service";
import { Appointment } from "@/services/appointment.service";
import { ConsultantProfile } from "@/services/consultant.service";
import { User } from "@/services/user.service";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Question } from "@/types/api.d"; // Import Question type
import { UserService } from "@/services/user.service"; // Import UserService
import { ConsultantService } from "@/services/consultant.service"; // Import ConsultantService
import { AppointmentService } from "@/services/appointment.service"; // Import AppointmentService

interface ChatRoomProps {
  questionId: string;
  initialTitle?: string; // Add optional initialTitle prop
  initialContent?: string; // Add optional initialContent prop
}

const ChatRoom: React.FC<ChatRoomProps> = ({ questionId, initialTitle, initialContent }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [chatQuestion, setChatQuestion] = useState<Question | null>(null);
  const [creatorUser, setCreatorUser] = useState<User | null>(null); // State for the creator user
  const [consultantProfile, setConsultantProfile] = useState<ConsultantProfile | null>(null); // State for the consultant
  const [appointmentDetails, setAppointmentDetails] = useState<Appointment | null>(null); // State for associated appointment
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

  const fetchChatData = useCallback(async (retriesRemaining = 3) => {
    setIsLoading(true);
    let currentQuestion: Question | null = null;

    try {
      // Try to fetch Question by questionId first
      currentQuestion = await ChatService.getQuestionById(questionId);
      setChatQuestion(currentQuestion);
      console.log("[ChatRoom] Fetched Question by ID:", currentQuestion);
    } catch (questionError: any) {
      console.error("[ChatRoom] Error fetching question by ID:", questionError);
      // If fetching Question fails, try to construct a Question from initial props
      if (initialTitle && initialContent && user) {
        currentQuestion = {
          id: questionId,
          title: initialTitle,
          content: initialContent,
          userId: user.id, // Assume current user is the creator if created via dialog
          status: "pending", // Default status for newly created chat
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setChatQuestion(currentQuestion);
        console.log("[ChatRoom] Constructed Question from initial props:", currentQuestion);
      }
    } finally {
      if (!currentQuestion) {
        toast({
          title: "Lỗi",
          description: "Không tìm thấy phòng chat. Vui lòng thử lại sau.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Fetch creator user details
      if (currentQuestion.userId) {
        try {
          const fetchedCreator = await UserService.getUserById(currentQuestion.userId);
          setCreatorUser(fetchedCreator);
        } catch (userError) {
          console.error("[ChatRoom] Error fetching creator user details:", userError);
          // Fallback if user details cannot be fetched (e.g., 403 Forbidden)
          setCreatorUser(null);
        }
      }

      // Fetch associated appointment and consultant details if appointmentId exists on the fetched/constructed question
      if (currentQuestion.appointmentId) {
        try {
          const fetchedAppointment = await AppointmentService.getAppointmentById(currentQuestion.appointmentId);
          setAppointmentDetails(fetchedAppointment);
          if (fetchedAppointment?.consultantId) {
            const fetchedConsultant = await ConsultantService.getConsultantProfile(fetchedAppointment.consultantId);
            setConsultantProfile(fetchedConsultant);
          }
        } catch (appError) {
          console.error("[ChatRoom] Error fetching appointment details for question:", appError);
          setAppointmentDetails(null); // Clear appointment details on error
          setConsultantProfile(null); // Clear consultant profile on error
        }
      }

      const messagesResponse = await ChatService.getQuestionMessages(questionId);
      setMessages(messagesResponse.data.reverse());
      await ChatService.markAllQuestionMessagesAsRead(questionId);
      setIsLoading(false);
    }
  }, [questionId, initialTitle, initialContent, toast, user]); // Add initialTitle, initialContent, user to dependencies

  useEffect(() => {
    if (!questionId) {
      setIsLoading(false);
      return;
    }

    fetchChatData();

    const socket = initializeSocket();

    const cleanupNewMessage = ChatService.onNewMessage((message) => {
      if (message.questionId === questionId) { // Filter by questionId
        setMessages((prevMessages) => {
          if (prevMessages.some((msg) => msg.id === message.id || msg.id.startsWith("temp-"))) {
            if (message.senderId === user?.id && prevMessages.some(msg => msg.content === message.content && msg.id.startsWith("temp-"))) {
              return prevMessages.map(msg => msg.content === message.content && msg.id.startsWith("temp-") ? message : msg);
            }
            return prevMessages;
          }
          return [...prevMessages, message];
        });
        if (message.senderId !== user?.id) {
          ChatService.markMessageAsRead(message.id);
        }
      }
    });

    const cleanupTypingStatus = ChatService.onTypingStatus((data) => {
      if (data.questionId === questionId && data.userId !== user?.id) { // Filter by questionId
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
      if (data.questionId === questionId) { // Filter by questionId
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === data.messageId ? { ...msg, isRead: true } : msg
          )
        );
      }
    });

    // Note: joinRoom and leaveRoom still use appointmentId in ChatService.
    // If the backend socket logic is tied to questionId, these methods in ChatService need to be updated.
    // For now, assuming they are not strictly necessary for basic message sending/receiving via REST APIs.
    // If real-time chat relies on joining a "question" room, then ChatService.joinRoom/leaveRoom need questionId versions.
    // ChatService.joinRoom(questionId).catch(console.error); // Temporarily commented out

    return () => {
      cleanupNewMessage();
      cleanupTypingStatus();
      cleanupMessageRead();
      // ChatService.leaveRoom(questionId).catch(console.error); // Temporarily commented out
      socket.disconnect();
    };
  }, [fetchChatData, questionId, user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending || !questionId) return;

    setIsSending(true);
    try {
      const tempMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        questionId: questionId, // Changed to questionId
        senderId: user?.id || "unknown",
        senderName: user?.fullName || "Bạn",
        content: newMessage,
        type: "text",
        createdAt: new Date().toISOString(),
        isRead: false,
      };

      setMessages((prevMessages) => [...prevMessages, tempMessage]);
      setNewMessage("");
      ChatService.setTyping(questionId, false);
      scrollToBottom();

      const sentMessage = await ChatService.sendQuestionMessage(questionId, { // Changed to sendQuestionMessage
        content: tempMessage.content,
        type: tempMessage.type,
      });

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === tempMessage.id
            ? {
                ...sentMessage,
                senderId: user?.id || "unknown",
                senderName: user?.fullName || "Bạn",
                content: sentMessage.content || tempMessage.content,
                type: sentMessage.type || tempMessage.type,
                createdAt: sentMessage.createdAt || tempMessage.createdAt,
                isRead: sentMessage.isRead || tempMessage.isRead,
                fileUrl: sentMessage.fileUrl || tempMessage.fileUrl,
                description: sentMessage.description || tempMessage.description,
              }
            : msg
        )
      );
      scrollToBottom();
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
    if (!file || !questionId) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", file.type.startsWith("image/") ? "image" : "file");

    setIsSending(true);
    try {
      const sentFileMessage = await ChatService.sendQuestionFile(questionId, formData); // Changed to sendQuestionFile
      setMessages((prevMessages) => {
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
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDownloadFile = async (messageId: string, filename: string) => {
    try {
      const response = await ChatService.downloadFile(messageId);
      if (response.fileUrl) {
        const link = document.createElement("a");
        link.href = response.fileUrl;
        link.download = filename;
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

  if (!chatQuestion) {
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
    // Determine if the sender is the creator of the question or a consultant
    if (creatorUser?.id === message.senderId) {
      return `${creatorUser.firstName} ${creatorUser.lastName}` || "Người dùng";
    }
    if (consultantProfile?.user.id === message.senderId) {
      return `${consultantProfile.user.firstName} ${consultantProfile.user.lastName}`;
    }
    return message.senderName || "Người dùng khác";
  };

  const getSenderAvatar = (message: ChatMessage) => {
    if (message.senderId === user?.id) {
      return user?.profilePicture || "";
    }
    if (creatorUser?.id === message.senderId) {
      return creatorUser.profilePicture || "";
    }
    if (consultantProfile?.user.id === message.senderId) {
      return consultantProfile.user.profilePicture || "";
    }
    return "";
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="flex flex-col h-[80vh]">
        <CardHeader className="border-b">
          <CardTitle className="text-2xl flex items-center justify-between">
            <span>Phòng chat: {chatQuestion.title}</span>
            <Badge className="ml-2">
              {chatQuestion.status === "pending" && "Chờ trả lời"}
              {chatQuestion.status === "answered" && "Đã trả lời"}
              {chatQuestion.status === "closed" && "Đã đóng"}
            </Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Người tạo: {creatorUser?.firstName} {creatorUser?.lastName || "N/A"}
            {consultantProfile && (
              <>
                <br />
                Tư vấn viên: {consultantProfile.user.firstName} {consultantProfile.user.lastName}
              </>
            )}
            {appointmentDetails && (
              <>
                <br />
                Cuộc hẹn: {format(new Date(appointmentDetails.appointmentDate), "dd/MM/yyyy HH:mm", { locale: vi })}
              </>
            )}
            <br />
            Ngày tạo: {format(new Date(chatQuestion.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
          </p>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-4">
          <ScrollArea className="h-full pr-4">
            {messages.map((message) => {
              const isCurrentUser = message.senderId === user?.id;
              return (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 mb-4 ${
                    isCurrentUser ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isCurrentUser && (
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
                      isCurrentUser ? "items-end" : "items-start"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">
                        {getSenderName(message)}
                      </span>
                    </div>
                    {message.type === "text" && (
                      <div
                        className={`p-3 rounded-lg ${
                          isCurrentUser ? "bg-blue-500 text-white" : "bg-muted"
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
                        {isCurrentUser && message.isRead && (
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
                    {isCurrentUser && (
                      <span className="text-xs text-muted-foreground mt-1">
                        {message.isRead ? "Đã xem" : "Đã gửi"}
                      </span>
                    )}
                  </div>
                  {isCurrentUser && (
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
              );
            })}
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
