"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BlogService } from "@/services/blog.service";
import { Blog } from "@/services/blog.service"; // Import Blog interface
import { PublishBlogDto } from "@/types/api.d"; // Import PublishBlogDto

interface BlogPublishModalProps {
  blog: Blog | null;
  onClose: () => void;
  onPublishSuccess: () => void;
  isDirectPublish?: boolean; // Add this prop
}

export default function BlogPublishModal({
  blog,
  onClose,
  onPublishSuccess,
  isDirectPublish = false, // Default to false
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
      const data: PublishBlogDto = { publishNotes };
      if (isDirectPublish) {
        await BlogService.directPublish(blog.id, data);
        setSuccess("Đã xuất bản trực tiếp thành công!");
      } else {
        await BlogService.publish(blog.id, data);
        setSuccess("Đã xuất bản thành công!");
      }
      onPublishSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Lỗi xuất bản");
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
        <h2 className="text-xl font-bold mb-4">
          {isDirectPublish ? "Xuất bản trực tiếp Blog" : "Xuất bản Blog"}: {blog.title}
        </h2>
        {!isDirectPublish && ( // Conditionally render notes for non-direct publish
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
        )}
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {success && <div className="text-green-600 mb-2">{success}</div>}
        <div className="flex gap-2 justify-end">
          <Button onClick={handlePublish} disabled={actionLoading}>
            {actionLoading
              ? isDirectPublish
                ? "Đang xuất bản trực tiếp..."
                : "Đang xuất bản..."
              : isDirectPublish
              ? "Xác nhận Xuất bản trực tiếp"
              : "Xác nhận Xuất bản"}
          </Button>
        </div>
      </div>
    </div>
  );
}
