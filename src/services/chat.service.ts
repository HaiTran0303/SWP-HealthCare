import { apiClient } from "./api";
import { io, Socket } from "socket.io-client";

export interface ChatQuestion {
  id: string;
  title: string;
  content?: string;
  isAnonymous?: boolean;
  createdAt: string;
  status: string;
  customerId: string;
  consultantId?: string;
  lastMessage?: {
    content: string;
    createdAt: string;
  };
  unreadCount?: number;
}

export interface ChatMessage {
  id: string;
  questionId: string;
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

  // Initialize socket with proper configuration
  const newSocket = io(SOCKET_URL, {
    path: "/socket.io",
    auth: { token: `Bearer ${token}` },
    transports: ["websocket", "polling"],
    autoConnect: false, // Don't connect automatically
    withCredentials: true,
    forceNew: true, // Force a new connection
  });

  // Connection events
  newSocket.on("connect", () => {
    console.log("Connected to chat server");
    // Join chat namespace after connection
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

  // Start connection
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
  // Room management
  joinQuestion(questionId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const socket = getSocket();
      socket.emit("join_question", { questionId }, (ack: any) => {
        if (ack.status === "success") resolve();
        else reject(ack);
      });
    });
  },

  leaveQuestion(questionId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const socket = getSocket();
      socket.emit("leave_question", { questionId }, (ack: any) => {
        if (ack.status === "success") resolve();
        else reject(ack);
      });
    });
  },

  // Typing indicator
  setTyping(questionId: string, isTyping: boolean) {
    const socket = getSocket();
    socket.emit("typing", { questionId, isTyping });
  },

  handleTyping(questionId: string) {
    this.setTyping(questionId, true);
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      this.setTyping(questionId, false);
    }, 3000);
  },

  // Message management
  async getQuestions(params: Record<string, any> = {}) {
    const query = new URLSearchParams(params).toString();
    return apiClient.get<PaginatedResponse<ChatQuestion>>(
      `/chat/questions${query ? `?${query}` : ""}`
    );
  },

  async getQuestionById(id: string) {
    return apiClient.get<ChatQuestion>(`/chat/questions/${id}/summary`);
  },

  async createQuestion(data: {
    title: string;
    content: string;
  }) {
    return apiClient.post<ChatQuestion>(`/chat/questions`, data);
  },

  async getMessages(questionId: string, params: Record<string, any> = {}) {
    const query = new URLSearchParams(params).toString();
    return apiClient.get<PaginatedResponse<ChatMessage>>(
      `/chat/questions/${questionId}/messages${query ? `?${query}` : ""}`
    );
  },

  async getMessagesWithUrls(
    questionId: string,
    params: Record<string, any> = {}
  ) {
    const query = new URLSearchParams(params).toString();
    return apiClient.get<PaginatedResponse<ChatMessage>>(
      `/chat/questions/${questionId}/messages/with-urls${query ? `?${query}` : ""}`
    );
  },

  async sendMessage(
    questionId: string,
    data: { content: string; type?: string }
  ) {
    // Adhere to the REST API for sending messages as per Swagger
    const payload = {
      content: data.content,
      type: data.type || "text", // Default to 'text' if not provided
      questionId: questionId,
    };
    return apiClient.post<ChatMessage>(`/chat/questions/${questionId}/messages`, payload);
  },

  async sendFile(questionId: string, formData: FormData) {
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    return apiClient.post<ChatMessage>(
      `/chat/questions/${questionId}/messages/file`,
      formData,
      config
    );
  },

  async sendPublicPdf(questionId: string, formData: FormData) {
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    return apiClient.post<ChatMessage>(
      `/chat/questions/${questionId}/messages/public-pdf`,
      formData,
      config
    );
  },

  async downloadFile(messageId: string) {
    return apiClient.get<{ fileUrl: string }>(
      `/chat/messages/${messageId}/file`
    );
  },

  async markMessageAsRead(messageId: string) {
    return apiClient.patch(`/chat/messages/${messageId}/read`);
  },

  async markAllMessagesAsRead(questionId: string) {
    return apiClient.patch(`/chat/questions/${questionId}/messages/read-all`);
  },

  async markMessageAsReadRealtime(questionId: string, messageId: string) {
    return new Promise((resolve, reject) => {
      const socket = getSocket();
      socket.emit("mark_as_read", { questionId, messageId }, (ack: any) => {
        if (ack.status === "success") resolve(ack);
        else reject(ack);
      });
    });
  },

  async deleteMessage(messageId: string) {
    return apiClient.delete(`/chat/messages/${messageId}`);
  },

  async getQuestionSummary(id: string) {
    return apiClient.get<ChatQuestion>(`/chat/questions/${id}/summary`);
  },

  async getUnreadCount() {
    return apiClient.get<{ unreadCount: number }>(
      `/chat/messages/unread-count`
    );
  },

  // Event listeners setup
  onNewMessage(callback: (message: ChatMessage) => void) {
    const socket = getSocket();
    socket.on("new_message", (data) => callback(data.data));
    return () => socket.off("new_message");
  },

  onTypingStatus(
    callback: (data: {
      userId: string;
      userName: string;
      isTyping: boolean;
      questionId: string;
    }) => void
  ) {
    const socket = getSocket();
    socket.on("typing_status", callback);
    return () => socket.off("typing_status");
  },

  onMessageRead(
    callback: (data: { messageId: string; userId: string }) => void
  ) {
    const socket = getSocket();
    socket.on("message_read", callback);
    return () => socket.off("message_read");
  },

  onUserJoined(
    callback: (data: {
      userId: string;
      userName: string;
      questionId: string;
    }) => void
  ) {
    const socket = getSocket();
    socket.on("user_joined", callback);
    return () => socket.off("user_joined");
  },

  onUserLeft(
    callback: (data: {
      userId: string;
      userName: string;
      questionId: string;
    }) => void
  ) {
    const socket = getSocket();
    socket.on("user_left", callback);
    return () => socket.off("user_left");
  },
};
