"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BlogService } from "@/services/blog.service";
import { Blog } from "@/services/blog.service"; // Import Blog interface

interface BlogPublishModalProps {
  blog: Blog | null; // Changed from blogId: string | null;
  onClose: () => void;
  onPublishSuccess: () => void;
}

export default function BlogPublishModal({
  blog,
  onClose,
  onPublishSuccess,
}: BlogPublishModalProps) {
  const [publishNotes, setPublishNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (blog) {
      setPublishNotes("");
      setError("");
      setSuccess("");
    }
  }, [blog]);

  const handlePublish = async () => {
    if (!blog) return;

    setActionLoading(true);
    setError("");
    setSuccess("");
    try {
      await BlogService.publish(blog.id, { publishNotes });
      setSuccess("Đã publish thành công!");
      onPublishSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Lỗi publish");
    } finally {
      setActionLoading(false);
    }
  };

  if (!blog) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-xl relative">
        <button
          className="absolute top-2 right-2 text-xl"
          onClick={onClose}
          aria-label="Đóng"
          tabIndex={0}
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4">Publish Blog: {blog.title}</h2>
        <div className="mb-4">
          <label htmlFor="publishNotes" className="font-medium">
            Ghi chú publish (không bắt buộc)
          </label>
          <textarea
            id="publishNotes"
            className="w-full border rounded px-2 py-1 mt-1"
            value={publishNotes}
            onChange={(e) => setPublishNotes(e.target.value)}
            placeholder="Nhập ghi chú publish"
          />
        </div>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {success && <div className="text-green-600 mb-2">{success}</div>}
        <div className="flex gap-2 justify-end">
          <Button onClick={handlePublish} disabled={actionLoading}>
            {actionLoading ? "Đang publish..." : "Xác nhận Publish"}
          </Button>
        </div>
      </div>
    </div>
  );
}
