"use client";
import { useEffect, useState } from "react";
import { Blog, BlogService } from "@/services/blog.service";
import { Button } from "@/components/ui/button";
import { fetchAllUsers } from "@/services/api";
import BlogReviewModal from "@/components/BlogReviewModal";
import BlogPublishModal from "@/components/BlogPublishModal"; // Import the new publish modal

export default function BlogReviewPage() {
  const [pendingBlogs, setPendingBlogs] = useState<Blog[]>([]);
  const [approvedBlogs, setApprovedBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null); // For review modal
  const [selectedBlogToPublish, setSelectedBlogToPublish] = useState<Blog | null>(null); // For publish modal
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
                      onClick={() => setSelectedBlogToPublish(blog)}
                    >
                      Publish
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Blog Review Modal */}
      <BlogReviewModal
        blog={selectedBlog}
        onClose={() => setSelectedBlog(null)}
        onReviewSuccess={fetchBlogs}
      />

      {/* Blog Publish Modal */}
      <BlogPublishModal
        blog={selectedBlogToPublish}
        onClose={() => setSelectedBlogToPublish(null)}
        onPublishSuccess={fetchBlogs}
      />
    </div>
  );
}
