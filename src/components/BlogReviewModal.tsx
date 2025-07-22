"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Blog, BlogService } from "@/services/blog.service";
import { cn } from "@/lib/utils";

interface BlogReviewModalProps {
  blog: Blog | null;
  onClose: () => void;
  onReviewSuccess: () => void;
}

export default function BlogReviewModal({
  blog,
  onClose,
  onReviewSuccess,
}: BlogReviewModalProps) {
  const [reviewStatus, setReviewStatus] = useState("approved");
  const [reason, setReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (blog) {
      setReviewStatus("approved");
      setReason("");
      setError("");
      setSuccess("");
    }
  }, [blog]);

  const handleReview = async () => {
    if (!blog) return;
    setActionLoading(true);
    setError("");
    setSuccess("");

    const reviewPayload: { status: string; rejectionReason?: string; revisionNotes?: string } = {
      status: reviewStatus,
    };

    if (reviewStatus === "needs_revision") {
      if (!reason.trim()) {
        setError("Vui lòng nhập ghi chú chỉnh sửa!");
        setActionLoading(false);
        return;
      }
      reviewPayload.revisionNotes = reason;
    } else if (reviewStatus === "rejected") {
      if (!reason.trim()) {
        setError("Vui lòng nhập lý do từ chối!");
        setActionLoading(false);
        return;
      }
      reviewPayload.rejectionReason = reason;
    } else if (reviewStatus === "approved") {
      // For 'approved' status, the 'reason' field is optional and maps to revisionNotes if provided.
      // If there's a reason, include it as revisionNotes. Otherwise, do not send revisionNotes.
      if (reason.trim()) {
        reviewPayload.revisionNotes = reason;
      }
    }

    try {
      await BlogService.review(blog.id, reviewPayload);
      setSuccess("Đã review thành công!");
      onReviewSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Lỗi review");
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
        <h2 className="text-xl font-bold mb-2">{blog.title}</h2>
        <div className="mb-4">{blog.content}</div>
        <div className="mb-4">
          <label htmlFor="reviewStatus" className="font-medium">Trạng thái review</label>
          <select
            id="reviewStatus"
            className="w-full border rounded px-2 py-1 mt-1"
            value={reviewStatus}
            onChange={(e) => {
              setReviewStatus(e.target.value);
              setReason("");
            }}
          >
            <option value="approved">Duyệt (approved)</option>
            <option value="needs_revision">Cần chỉnh sửa (needs_revision)</option>
            <option value="rejected">Từ chối (rejected)</option>
          </select>
        </div>
        {reviewStatus === "approved" && (
          <div className="mb-4">
            <label htmlFor="revisionNotes" className="font-medium">
              Ghi chú chỉnh sửa (revisionNotes)
            </label>
            <textarea
              id="revisionNotes"
              className="w-full border rounded px-2 py-1 mt-1"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              placeholder="Nhập ghi chú chỉnh sửa"
            />
          </div>
        )}
        {reviewStatus === "rejected" && (
          <div className="mb-4">
            <label htmlFor="rejectionReason" className="font-medium">
              Lý do từ chối (rejectionReason)
            </label>
            <textarea
              id="rejectionReason"
              className="w-full border rounded px-2 py-1 mt-1"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              placeholder="Nhập lý do từ chối"
            />
          </div>
        )}
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {success && <div className="text-green-600 mb-2">{success}</div>}
        <div className="flex gap-2 justify-end">
          <Button onClick={handleReview} disabled={actionLoading}>
            {actionLoading ? "Đang gửi..." : "Gửi review"}
          </Button>
        </div>
      </div>
    </div>
  );
}
