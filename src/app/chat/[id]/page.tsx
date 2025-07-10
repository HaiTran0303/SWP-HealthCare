"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  ChatService,
  ChatMessage,
  ChatQuestion,
  getSocket,
} from "@/services/chat.service";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function ChatDetailPage() {
  const params = useParams();
  const questionId = params?.id as string;
  const { user } = useAuth();
  const [question, setQuestion] = useState<ChatQuestion | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);
  const [activeTab, setActiveTab] = useState<string>("messages");
  const [summary, setSummary] = useState<any>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [mockMode, setMockMode] = useState(false);

  const canSend = !!user;

  useEffect(() => {
    if (!questionId) return;
    setLoading(true);
    Promise.all([
      ChatService.getQuestionSummary(questionId),
      ChatService.getMessages(questionId),
    ])
      .then(([summary, msgs]) => {
        setQuestion(summary);
        setMessages(Array.isArray(msgs) ? msgs : []);
      })
      .catch(() => {
        setError("Không tìm thấy cuộc trò chuyện");
        setMessages([]);
      })
      .finally(() => setLoading(false));
  }, [questionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Realtime socket logic
  useEffect(() => {
    if (!questionId || !user) return;
    const socket = getSocket();
    socketRef.current = socket;
    // Debug: log kết nối socket
    socket.on("connect", () => {
      console.log("Socket connected", socket.id);
      setMockMode(false);
    });
    socket.on("connect_error", (err) => {
      console.error("Socket error", err);
      setMockMode(true);
    });
    // Join room
    socket.emit("join_question", { questionId });
    // Mark as read all
    socket.emit("mark_as_read", { questionId });
    // Listen events
    socket.on("new_message", (msg: any) => {
      if (!mockMode) {
        console.log("Received new_message", msg);
        setMessages((prev) => (Array.isArray(prev) ? [...prev, msg] : [msg]));
      }
    });
    socket.on("typing_status", (data: any) => {
      if (data.questionId === questionId && data.userId !== user.id) {
        setOtherTyping(data.isTyping);
      }
    });
    // Clean up
    return () => {
      socket.emit("leave_question", { questionId });
      socket.off("new_message");
      socket.off("typing_status");
      socket.off("connect");
      socket.off("connect_error");
    };
  }, [questionId, user]);

  // Emit typing
  useEffect(() => {
    if (!socketRef.current || !questionId || !user) return;
    if (isTyping) {
      socketRef.current.emit("typing", { questionId, isTyping: true });
      const timeout = setTimeout(() => {
        setIsTyping(false);
        socketRef.current.emit("typing", { questionId, isTyping: false });
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [isTyping, questionId, user]);

  useEffect(() => {
    if (activeTab === "summary" && questionId) {
      setSummaryLoading(true);
      ChatService.getQuestionSummary(questionId)
        .then((data) => setSummary(data))
        .catch(() => setSummary(null))
        .finally(() => setSummaryLoading(false));
    }
  }, [activeTab, questionId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && !file) return;
    setSending(true);
    setError("");
    try {
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        await ChatService.sendFile(questionId, formData);
        setFile(null);
      }
      if (message.trim()) {
        if (mockMode) {
          if (user) {
            // Thêm tin nhắn vào state trực tiếp (demo offline)
            setMessages((prev) => [
              ...prev,
              {
                id: Math.random().toString(36).slice(2),
                questionId,
                senderId: user.id,
                content: message,
                type: "TEXT",
                createdAt: new Date().toISOString(),
              },
            ]);
          }
        } else {
          // Gửi qua socket
          console.log("Emit send_message", { questionId, content: message });
          socketRef.current.emit("send_message", {
            questionId,
            content: message,
            type: "TEXT",
          });
        }
        setMessage("");
      }
      setIsTyping(false);
    } catch (err: any) {
      setError(err?.message || "Lỗi gửi tin nhắn");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="p-8">Đang tải...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!question || !user) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">{question.title}</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="messages">Tin nhắn</TabsTrigger>
          <TabsTrigger value="summary">Tóm tắt</TabsTrigger>
        </TabsList>
      </Tabs>
      {activeTab === "messages" && (
        <div>
          {mockMode && (
            <div className="text-xs text-orange-500 mb-2">
              Đang ở chế độ demo, không có realtime backend.
            </div>
          )}
          <div className="border rounded p-4 h-[400px] overflow-y-auto bg-gray-50 mb-4">
            {Array.isArray(messages) && messages.length === 0 ? (
              <div className="text-gray-500">Chưa có tin nhắn nào.</div>
            ) : (
              Array.isArray(messages) &&
              messages.map((msg) => (
                <div
                  key={msg.id || Math.random()}
                  className={`mb-2 flex ${msg.senderId === user.id ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`rounded px-3 py-2 max-w-[70%] ${msg.senderId === user.id ? "bg-blue-100" : "bg-white border"}`}
                  >
                    <div className="text-sm font-medium mb-1">
                      {msg.senderId === user.id ? "Bạn" : msg.senderId}
                    </div>
                    <div>{msg.content}</div>
                    {msg.fileUrl && (
                      <div className="mt-2">
                        {msg.fileUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                          <a
                            href={msg.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              src={msg.fileUrl}
                              alt="file"
                              className="max-h-32 rounded border"
                            />
                          </a>
                        ) : (
                          <a
                            href={msg.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            📎 Tải file đính kèm
                          </a>
                        )}
                      </div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
            {otherTyping && (
              <div className="text-xs text-gray-500">Đang nhập...</div>
            )}
          </div>
          {canSend && (
            <form onSubmit={handleSend} className="flex gap-2 items-center">
              <input
                className="flex-1 border rounded px-2 py-1"
                placeholder="Nhập tin nhắn..."
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setIsTyping(true);
                }}
                disabled={sending}
              />
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                disabled={sending}
              />
              <Button
                type="submit"
                disabled={sending || (!message.trim() && !file)}
              >
                Gửi
              </Button>
            </form>
          )}
          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        </div>
      )}
      {activeTab === "summary" && (
        <div className="border rounded p-4 bg-gray-50">
          {summaryLoading ? (
            <div>Đang tải tóm tắt...</div>
          ) : summary ? (
            <div className="space-y-2">
              <div>
                <b>Tiêu đề:</b> {summary.title}
              </div>
              <div>
                <b>Trạng thái:</b> {summary.status}
              </div>
              <div>
                <b>Ngày tạo:</b>{" "}
                {summary.createdAt
                  ? new Date(summary.createdAt).toLocaleString()
                  : "-"}
              </div>
              <div>
                <b>Khách hàng:</b> {summary.customerId || "-"}
              </div>
              <div>
                <b>Tư vấn viên:</b> {summary.consultantId || "-"}
              </div>
              <div>
                <b>Số tin nhắn:</b>{" "}
                {summary.messageCount || summary.messagesCount || "-"}
              </div>
              {/* Có thể bổ sung thêm các trường khác nếu cần */}
            </div>
          ) : (
            <div>Không có dữ liệu tóm tắt.</div>
          )}
        </div>
      )}
    </div>
  );
}
