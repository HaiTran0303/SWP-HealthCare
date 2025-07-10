"use client";
import { useEffect, useState } from "react";
import { Blog, BlogService } from "@/services/blog.service";
import { Button } from "@/components/ui/button";
import { fetchAllUsers } from "@/services/api";

export default function BlogReviewPage() {
  const [pendingBlogs, setPendingBlogs] = useState<Blog[]>([]);
  const [approvedBlogs, setApprovedBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [reviewStatus, setReviewStatus] = useState("approved");
  const [reason, setReason] = useState("");
  const [publishNotes, setPublishNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchBlogs();
    fetchAllUsers()
      .then((res) => {
        if (Array.isArray(res?.data)) setUsers(res.data);
        else if (Array.isArray(res)) setUsers(res);
        else setUsers([]);
      })
      .catch(() => setUsers([]));
  }, []);

  const fetchBlogs = () => {
    setLoading(true);
    Promise.all([BlogService.getPendingReview(), BlogService.getApproved()])
      .then(([pending, approved]) => {
        setPendingBlogs(Array.isArray(pending) ? pending : []);
        setApprovedBlogs(Array.isArray(approved) ? approved : []);
      })
      .catch(() => {
        setPendingBlogs([]);
        setApprovedBlogs([]);
      })
      .finally(() => setLoading(false));
  };

  function getAuthorName(authorId: string) {
    const user = users.find((u) => u.id === authorId);
    if (!user) return authorId;
    return (user.firstName || "") + (user.lastName ? " " + user.lastName : "");
  }

  const handleReview = async () => {
    if (!selectedBlog) return;
    setActionLoading(true);
    setError("");
    setSuccess("");
    try {
      await BlogService.review(selectedBlog.id, {
        status: reviewStatus,
        ...(reviewStatus === "approved" && { revisionNotes: reason }),
        ...(reviewStatus === "rejected" && { rejectionReason: reason }),
      });
      setSuccess("Đã review thành công!");
      setSelectedBlog(null);
      fetchBlogs();
    } catch (err: any) {
      setError(err?.message || "Lỗi review");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublish = async (blogId: string) => {
    setActionLoading(true);
    setError("");
    setSuccess("");
    try {
      await BlogService.publish(blogId, { publishNotes });
      setSuccess("Đã publish thành công!");
      setPublishNotes("");
      fetchBlogs();
    } catch (err: any) {
      setError(err?.message || "Lỗi publish");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Blog chờ duyệt & đã duyệt</h1>
      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <>
          <h2 className="text-lg font-semibold mt-4 mb-2">Chờ duyệt</h2>
          {pendingBlogs.length === 0 ? (
            <div className="text-red-500">Không có blog chờ duyệt</div>
          ) : (
            <div className="grid gap-6">
              {pendingBlogs.map((blog) => (
                <div
                  key={blog.id}
                  className="border rounded-lg p-4 shadow bg-white flex flex-col md:flex-row md:items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-lg">{blog.title}</div>
                    <div className="text-gray-600">
                      Trạng thái: {blog.status}
                    </div>
                    <div className="text-gray-600">
                      Tác giả: {getAuthorName(blog.authorId)}
                    </div>
                  </div>
                  <Button
                    className="mt-2 md:mt-0"
                    onClick={() => setSelectedBlog(blog)}
                  >
                    Xem chi tiết & Review
                  </Button>
                </div>
              ))}
            </div>
          )}

          <h2 className="text-lg font-semibold mt-8 mb-2">
            Đã duyệt (approved)
          </h2>
          {approvedBlogs.length === 0 ? (
            <div className="text-gray-500">Không có blog đã duyệt</div>
          ) : (
            <div className="grid gap-6">
              {approvedBlogs.map((blog) => (
                <div
                  key={blog.id}
                  className="border rounded-lg p-4 shadow bg-white flex flex-col md:flex-row md:items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-lg">{blog.title}</div>
                    <div className="text-gray-600">
                      Trạng thái: {blog.status}
                    </div>
                    <div className="text-gray-600">
                      Tác giả: {getAuthorName(blog.authorId)}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 mt-2 md:mt-0">
                    <Button
                      onClick={() => handlePublish(blog.id)}
                      disabled={actionLoading}
                    >
                      {actionLoading ? "Đang publish..." : "Publish"}
                    </Button>
                    <input
                      className="border rounded px-2 py-1 mt-1"
                      placeholder="Ghi chú publish (không bắt buộc)"
                      value={publishNotes}
                      onChange={(e) => setPublishNotes(e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal review */}
      {selectedBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-xl relative">
            <button
              className="absolute top-2 right-2 text-xl"
              onClick={() => setSelectedBlog(null)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-2">{selectedBlog.title}</h2>
            <div className="mb-4">{selectedBlog.content}</div>
            <div className="mb-4">
              <label className="font-medium">Trạng thái review</label>
              <select
                className="w-full border rounded px-2 py-1 mt-1"
                value={reviewStatus}
                onChange={(e) => {
                  setReviewStatus(e.target.value);
                  setReason("");
                }}
              >
                <option value="approved">Duyệt (approved)</option>
                <option value="rejected">Từ chối (rejected)</option>
              </select>
            </div>
            {reviewStatus === "approved" && (
              <div className="mb-4">
                <label className="font-medium">
                  Ghi chú chỉnh sửa (revisionNotes)
                </label>
                <textarea
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
                <label className="font-medium">
                  Lý do từ chối (rejectionReason)
                </label>
                <textarea
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
              <Button
                onClick={async () => {
                  if (!reason.trim()) {
                    setError(
                      reviewStatus === "approved"
                        ? "Vui lòng nhập ghi chú chỉnh sửa!"
                        : "Vui lòng nhập lý do từ chối!"
                    );
                    return;
                  }
                  setActionLoading(true);
                  setError("");
                  setSuccess("");
                  try {
                    await BlogService.review(selectedBlog.id, {
                      status: reviewStatus,
                      ...(reviewStatus === "approved" && {
                        revisionNotes: reason,
                      }),
                      ...(reviewStatus === "rejected" && {
                        rejectionReason: reason,
                      }),
                    });
                    setSuccess("Đã review thành công!");
                    setSelectedBlog(null);
                    fetchBlogs();
                  } catch (err: any) {
                    setError(err?.message || "Lỗi review");
                  } finally {
                    setActionLoading(false);
                  }
                }}
                disabled={actionLoading}
              >
                {actionLoading ? "Đang gửi..." : "Gửi review"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
