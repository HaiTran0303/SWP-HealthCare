"use client";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Blog, BlogService } from "@/services/blog.service";
import { fetchAllUsers } from "@/services/api";
import BlogCreateWithImage from "@/components/BlogCreateWithImage";
import EditBlogModal from "@/components/EditBlogModal";
import BlogReasonModal from "@/components/BlogReasonModal";
import { useRouter } from "next/navigation";

export default function BlogManagePage() {
  const { user } = useAuth();
  let roleName = "";
  if (
    user?.role &&
    typeof user.role === "object" &&
    typeof user.role.name === "string"
  ) {
    roleName = user.role.name.toLowerCase();
  }
  const canCreate = ["admin", "manager", "consultant"].includes(roleName);

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [showImageModal, setShowImageModal] = useState<string | null>(null);
  const [editBlog, setEditBlog] = useState<any | null>(null);
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [selectedBlogReason, setSelectedBlogReason] = useState({
    rejectionReason: "",
    revisionNotes: "",
  });
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const fetchBlogs = () => {
    if (!canCreate) return;
    setLoading(true);
    const params: any = {};
    if (search) params.title = search;
    if (status) params.status = status;

    BlogService.getAll(params)
      .then((data: any) => {
        if (Array.isArray(data)) {
          setBlogs(data);
        } else if (Array.isArray(data?.data)) {
          setBlogs(data.data);
        } else {
          setBlogs([]);
        }
      })
      .catch(() => setBlogs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBlogs();
    fetchAllUsers()
      .then((res) => {
        if (Array.isArray(res?.data)) setUsers(res.data);
        else if (Array.isArray(res)) setUsers(res);
        else setUsers([]);
      })
      .catch(() => setUsers([]));
  }, [canCreate, search, status]);

  // Helper to get author full name
  function getAuthorName(authorId: string) {
    const user = users.find((u) => u.id === authorId);
    if (!user) return authorId;
    return (user.firstName || "") + (user.lastName ? " " + user.lastName : "");
  }

  const handleOpenReasonModal = (blog: Blog) => {
    setSelectedBlogReason({
      rejectionReason: blog.rejectionReason || "",
      revisionNotes: blog.revisionNotes || "",
    });
    setReasonModalOpen(true);
  };

  const handleDeleteBlog = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xoá blog này?")) return;
    try {
      await BlogService.delete(id);
      setBlogs((prev) => prev.filter((b) => b.id !== id));
    } catch (err: any) {
      alert(err?.message || "Xoá blog thất bại");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quản lý bài viết</h1>
        {canCreate && (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded px-2 py-1"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="">Trạng thái</option>
              <option value="draft">Draft</option>
              <option value="pending_review">Pending Review</option>
              <option value="needs_revision">Needs Revision</option>
              <option value="rejected">Rejected</option>
              <option value="approved">Approved</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
            <Link href="/blog/new">
              <Button>Thêm bài viết</Button>
            </Link>
            <Link href="/blog/review">
              <Button variant="outline">Review Blog</Button>
            </Link>
            <Link href="/blog/categories">
              <Button variant="outline">Quản lý chủ đề</Button>
            </Link>
          </div>
        )}
      </div>
      {canCreate &&
        (loading ? (
          <div>Đang tải...</div>
        ) : blogs.length === 0 ? (
          <div>Không có blog nào.</div>
        ) : (
          <div className="overflow-x-auto mt-6">
            <table className="min-w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Tiêu đề</th>
                  <th className="p-2 border text-center">Chủ đề</th>
                  <th className="p-2 border text-center">Tác giả</th>
                  <th className="p-2 border text-center">Trạng thái</th>
                  <th className="p-2 border text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-gray-50">
                    <td className="p-2 border font-medium">{blog.title}</td>
                    <td className="p-2 border text-center">
                      {blog.category?.name || ""}
                    </td>
                    <td className="p-2 border text-center">
                      {getAuthorName(blog.authorId)}
                    </td>
                    <td className="p-2 border text-center">{blog.status}</td>
                    <td className="p-2 border text-center">
                      <div className="flex gap-2 justify-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowImageModal(blog.id)}
                        >
                          Cập nhật ảnh
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setEditBlog(blog)}
                        >
                          Chỉnh sửa
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteBlog(blog.id)}
                          disabled={
                            roleName !== "admin" && roleName !== "manager"
                          }
                          style={{
                            display:
                              roleName === "admin" || roleName === "manager"
                                ? undefined
                                : "none",
                          }}
                        >
                          Xoá
                        </Button>
                        {(blog.rejectionReason || blog.revisionNotes) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenReasonModal(blog)}
                          >
                            Xem lý do
                          </Button>
                        )}
                      </div>
                      {showImageModal === blog.id && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg relative">
                            <button
                              className="absolute top-2 right-2 text-xl"
                              onClick={() => setShowImageModal(null)}
                            >
                              &times;
                            </button>
                            <h3 className="text-lg font-bold mb-4">
                              Cập nhật ảnh cho blog
                            </h3>
                            <BlogCreateWithImage blogId={blog.id} />
                          </div>
                        </div>
                      )}
                      {editBlog && editBlog.id === blog.id && (
                        <EditBlogModal
                          blog={editBlog}
                          onClose={() => setEditBlog(null)}
                          onSuccess={() => {
                            setEditBlog(null);
                            BlogService.getAll().then((data: any) => {
                              if (Array.isArray(data)) setBlogs(data);
                              else if (Array.isArray(data?.data))
                                setBlogs(data.data);
                            });
                          }}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      <BlogReasonModal
        open={reasonModalOpen}
        onClose={() => setReasonModalOpen(false)}
        rejectionReason={selectedBlogReason.rejectionReason || ""}
        revisionNotes={selectedBlogReason.revisionNotes || ""}
      />
    </div>
  );
}
