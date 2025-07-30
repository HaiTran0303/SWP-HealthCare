import { apiClient } from "./api";
import { io, Socket } from "socket.io-client";
import { Appointment } from "@/services/appointment.service"; // Import Appointment type
import { User } from "@/services/user.service"; // Import User type
import { ConsultantProfile } from "@/services/consultant.service"; // Import ConsultantProfile type
import { ApiResponse, CreateQuestionDto, Question } from "@/types/api.d"; // Import ApiResponse, CreateQuestionDto and Question

export interface ChatRoom {
  id: string;
  appointmentId: string;
  userId: string;
  consultantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  appointmentId?: string; // Make optional, for appointment-based chats
  questionId?: string; // Make optional, for question-based chats
  senderId: string;
  senderName?: string;
  content: string;
  type: string;
  createdAt: string;
  isRead?: boolean;
  fileUrl?: string;
  description?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
}

let socket: Socket | null = null;
let typingTimeout: NodeJS.Timeout;
let reconnectAttempts = 0;

export function initializeSocket(): Socket {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : undefined;
  const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const newSocket = io(SOCKET_URL, {
    path: "/socket.io",
    auth: { token: `Bearer ${token}` },
    transports: ["websocket", "polling"],
    autoConnect: false,
    withCredentials: true,
    forceNew: true,
  });

  newSocket.on("connect", () => {
    console.log("Connected to chat server");
    newSocket.emit("join_namespace", { namespace: "chat" }, (response: any) => {
      console.log("Namespace join response:", response);
    });
    reconnectAttempts = 0;
  });

  newSocket.on("connected", (data) => {
    console.log("Server confirmed connection:", data);
  });

  newSocket.on("disconnect", (reason) => {
    console.log("Disconnected:", reason);
    if (reason !== "io client disconnect") {
      console.log("Attempting to reconnect...");
      newSocket.connect();
    }
  });

  newSocket.on("connect_error", (error) => {
    console.error("Connection failed:", error);
    const backoffTime = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
    reconnectAttempts++;

    setTimeout(() => {
      newSocket.connect();
    }, backoffTime);
  });

  newSocket.connect();
  return newSocket;
}

export function getSocket(): Socket {
  if (!socket) {
    socket = initializeSocket();
  }
  return socket;
}

export const ChatService = {
  async getAppointmentChatDetails(appointmentId: string): Promise<Appointment & { user: User, consultant: ConsultantProfile }> {
    const res = await apiClient.get<Appointment & { user: User, consultant: ConsultantProfile }>(
      `/appointments/${appointmentId}/chat-details`
    );
    return res;
  },

  async joinRoom(appointmentId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      getSocket().emit("join_appointment_chat", { appointmentId }, (ack: any) => {
        if (ack.status === "success") resolve();
        else reject(ack);
      });
    });
  },

  async leaveRoom(appointmentId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      getSocket().emit("leave_appointment_chat", { appointmentId }, (ack: any) => {
        if (ack.status === "success") resolve();
        else reject(ack);
      });
    });
  },

  async setTyping(appointmentId: string, isTyping: boolean) {
    try {
        getSocket().emit("typing", { appointmentId, isTyping });
    } catch (error) {
        console.error("Could not set typing status:", error);
    }
  },

  handleTyping(appointmentId: string) {
    this.setTyping(appointmentId, true);
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      this.setTyping(appointmentId, false);
    }, 3000);
  },

  // Appointment-based chat methods (restored/renamed for clarity)
  async getAppointmentMessages(appointmentId: string, params: Record<string, any> = {}) {
    const query = new URLSearchParams(params).toString();
    return apiClient.get<PaginatedResponse<ChatMessage>>(
      `/appointments/${appointmentId}/messages?${query}`
    );
  },

  async getAppointmentMessagesWithUrls(
    appointmentId: string,
    params: Record<string, any> = {}
  ) {
    const query = new URLSearchParams(params).toString();
    return apiClient.get<PaginatedResponse<ChatMessage>>(
      `/appointments/${appointmentId}/messages/with-urls?${query}`
    );
  },

  async sendAppointmentMessage(
    appointmentId: string,
    data: { content: string; type?: string }
  ) {
    const payload = {
      content: data.content,
      type: data.type || "text",
      appointmentId: appointmentId,
    };
    return apiClient.post<ChatMessage>(
      `/appointments/${appointmentId}/messages`,
      payload
    );
  },

  async sendAppointmentFile(appointmentId: string, formData: FormData) {
    return apiClient.post<ChatMessage>(
      `/appointments/${appointmentId}/messages/file`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
  },

  async sendAppointmentPublicPdf(appointmentId: string, formData: FormData) {
    return apiClient.post<ChatMessage>(
      `/appointments/${appointmentId}/messages/public-pdf`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
  },

  // Question-based chat methods
  async getQuestionMessages(questionId: string, params: Record<string, any> = {}) {
    const query = new URLSearchParams(params).toString();
    return apiClient.get<PaginatedResponse<ChatMessage>>(
      `/chat/questions/${questionId}/messages?${query}`
    );
  },

  async getQuestionMessagesWithUrls(
    questionId: string,
    params: Record<string, any> = {}
  ) {
    const query = new URLSearchParams(params).toString();
    return apiClient.get<PaginatedResponse<ChatMessage>>(
      `/chat/questions/${questionId}/messages/with-urls?${query}`
    );
  },

  async sendQuestionMessage(
    questionId: string,
    data: { content: string; type?: string }
  ) {
    const payload = {
      content: data.content,
      type: data.type || "text",
      questionId: questionId,
    };
    return apiClient.post<ChatMessage>(
      `/chat/questions/${questionId}/messages`,
      payload
    );
  },

  async sendQuestionFile(questionId: string, formData: FormData) {
    return apiClient.post<ChatMessage>(
      `/chat/questions/${questionId}/messages/file`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
  },

  async sendQuestionPublicPdf(questionId: string, formData: FormData) {
    return apiClient.post<ChatMessage>(
      `/chat/questions/${questionId}/messages/public-pdf`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
  },

  async downloadFile(messageId: string) {
    return apiClient.get<{ fileUrl: string }>(
      `/chat/messages/${messageId}/file`
    );
  },

  async markAllAppointmentMessagesAsRead(appointmentId: string) {
    return apiClient.patch(`/appointments/${appointmentId}/messages/read-all`);
  },

  async markAllQuestionMessagesAsRead(questionId: string) {
    return apiClient.patch(`/chat/questions/${questionId}/messages/read-all`);
  },

  async deleteMessage(messageId: string) {
    return apiClient.delete(`/chat/messages/${messageId}`);
  },

  async getUnreadCount() {
    // This might need to be updated to be per-appointment or for all appointments for a user/consultant
    return apiClient.get<{ unreadCount: number }>(
      `/chat/messages/unread-count`
    );
  },

  async markMessageAsRead(messageId: string) {
    return apiClient.patch(`/chat/messages/${messageId}/read`);
  },

  async createQuestion(data: CreateQuestionDto): Promise<ApiResponse<Question>> {
    return apiClient.post<ApiResponse<Question>>("/chat/questions", data);
  },

  async getQuestions(params: { search?: string; page?: number; limit?: number } = {}): Promise<PaginatedResponse<Question>> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return apiClient.get<PaginatedResponse<Question>>(`/chat/questions${query ? `?${query}` : ""}`);
  },

  async getQuestionById(questionId: string): Promise<Question> {
    try {
      console.log(`[ChatService] Attempting to fetch question with ID: ${questionId}`);
      const res = await apiClient.get<Question>(`/chat/questions/${questionId}`);
      console.log(`[ChatService] Successfully fetched question ${questionId}:`, res);
      return res;
    } catch (error: any) {
      console.error(`[ChatService] Error fetching question ${questionId}:`, error);
      if (error.response) {
        console.error("[ChatService] API Error Response Data:", error.response.data);
        console.error("[ChatService] API Error Response Status:", error.response.status);
      }
      throw error;
    }
  },

  async getChatRoomByAppointmentId(appointmentId: string): Promise<ChatRoom> {
    const res = await apiClient.get<ChatRoom>(`/appointments/${appointmentId}/chat-room`);
    return res;
  },

  onNewMessage(
    callback: (message: ChatMessage) => void
  ) {
    const socket = getSocket();
    const handler = (data: { data: ChatMessage }) => {
      callback(data.data);
    };
    socket.on("new_message", handler);
    return () => socket.off("new_message", handler);
  },

  onTypingStatus(
    callback: (data: {
      userId: string;
      userName: string;
      isTyping: boolean;
      appointmentId?: string; // Can be for appointment or question
      questionId?: string; // Can be for appointment or question
    }) => void
  ) {
    const socket = getSocket();
    const handler = (data: {
      userId: string;
      userName: string;
      isTyping: boolean;
      appointmentId?: string;
      questionId?: string;
    }) => {
      callback(data);
    };
    socket.on("typing_status", handler);
    return () => socket.off("typing_status", handler);
  },

  onMessageRead(
    callback: (data: { messageId: string; userId: string; appointmentId?: string; questionId?: string }) => void
  ) {
    const socket = getSocket();
    const handler = (data: {
      messageId: string;
      userId: string;
      appointmentId?: string;
      questionId?: string;
    }) => {
      callback(data);
    };
    socket.on("message_read", handler);
    return () => socket.off("message_read", handler);
  },
};
