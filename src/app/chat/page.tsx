"use client";

import { useEffect, useState } from "react";
import { ChatQuestion, ChatService } from "@/services/chat.service";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function ChatListPage() {
  const [questions, setQuestions] = useState<ChatQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [error, setError] = useState("");
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    setLoading(true);
    ChatService.getQuestions({ title: search })
      .then((data: any) => {
        if (Array.isArray(data)) {
          setQuestions(data);
        } else if (Array.isArray(data?.data)) {
          setQuestions(data.data);
        } else {
          setQuestions([]);
        }
      })
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    ChatService.getUnreadCount?.()
      .then((count: any) =>
        setUnreadCount(typeof count === "number" ? count : count?.count || 0)
      )
      .catch(() => setUnreadCount(0));
  }, []);

  // TODO: Lấy role từ AuthContext
  const canCreate = true; // Thay bằng kiểm tra role thực tế

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    setCreateLoading(true);
    setError("");
    try {
      await ChatService.createQuestion({
        title: newTitle,
        content: newContent,
      });
      setShowCreate(false);
      setNewTitle("");
      setNewContent("");
      setLoading(true);
      const data: any = await ChatService.getQuestions({ title: search });
      if (Array.isArray(data)) {
        setQuestions(data);
      } else if (Array.isArray(data?.data)) {
        setQuestions(data.data);
      } else {
        setQuestions([]);
      }
    } catch (err: any) {
      setError(err?.message || "Lỗi tạo câu hỏi");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          Hộp thư tư vấn
          {unreadCount > 0 && <Badge variant="secondary">{unreadCount}</Badge>}
        </h1>
        {canCreate && (
          <Button onClick={() => setShowCreate(true)}>Tạo câu hỏi mới</Button>
        )}
      </div>
      <div className="mb-4">
        <input
          className="border rounded px-2 py-1"
          placeholder="Tìm kiếm tiêu đề..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {loading ? (
        <div>Đang tải...</div>
      ) : questions.length === 0 ? (
        <div>Không có cuộc trò chuyện nào.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Tiêu đề</th>
                <th className="p-2 border">Trạng thái</th>
                <th className="p-2 border">Ngày tạo</th>
                <th className="p-2 border">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id} className="hover:bg-gray-50">
                  <td className="p-2 border font-medium">{q.title}</td>
                  <td className="p-2 border">{q.status}</td>
                  <td className="p-2 border">
                    {new Date(q.createdAt).toLocaleString()}
                  </td>
                  <td className="p-2 border">
                    <Link href={`/chat/${q.id}`}>
                      <Button size="sm" variant="outline">
                        Vào chat
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Dialog tạo câu hỏi */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-sm w-full">
            <h2 className="font-bold mb-2">Tạo câu hỏi mới</h2>
            <form onSubmit={handleCreate} className="space-y-2">
              <input
                className="w-full border rounded px-2 py-1"
                placeholder="Nhập tiêu đề câu hỏi..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
              <textarea
                className="w-full border rounded px-2 py-1"
                placeholder="Nhập nội dung câu hỏi..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                required
                rows={3}
              />
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setShowCreate(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={createLoading}>
                  {createLoading ? "Đang tạo..." : "Tạo"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
