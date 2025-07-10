import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { updateBlog, BlogService } from "@/services/blog.service";
import { CategoryService, Category } from "@/services/category.service";

interface EditBlogModalProps {
  blog: any;
  onClose: () => void;
  onSuccess?: () => void;
}

const STATUS_OPTIONS = [
  { value: "draft", label: "Nháp" },
  { value: "published", label: "Đã xuất bản" },
  { value: "archived", label: "Lưu trữ" },
];

export default function EditBlogModal({
  blog,
  onClose,
  onSuccess,
}: EditBlogModalProps) {
  const [title, setTitle] = useState(blog.title || "");
  const [content, setContent] = useState(blog.content || "");
  const [categoryId, setCategoryId] = useState(blog.categoryId || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState(true);
  const [status, setStatus] = useState(blog.status || "draft");

  useEffect(() => {
    setCatLoading(true);
    CategoryService.getAllCategories()
      .then((data: any) => {
        if (Array.isArray(data)) setCategories(data);
        else if (Array.isArray((data as any)?.data))
          setCategories((data as any).data);
        else setCategories([]);
      })
      .catch(() => setCategories([]))
      .finally(() => setCatLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const updateData: any = { title, content, categoryId };
      if (blog.status === "published" || blog.status === "archived") {
        updateData.status = status;
      }
      await updateBlog(blog.id, updateData);
      setSuccess("Cập nhật thành công!");
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await BlogService.submitReview(blog.id);
      setSuccess("Đã gửi bài blog để duyệt!");
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Lỗi gửi duyệt");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg relative">
        <button className="absolute top-2 right-2 text-xl" onClick={onClose}>
          &times;
        </button>
        <h3 className="text-lg font-bold mb-4">Chỉnh sửa Blog</h3>
        {error && <div className="mb-2 text-red-600">{error}</div>}
        {success && <div className="mb-2 text-green-600">{success}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1 text-left">Tiêu đề</label>
            <Input
              placeholder="Tiêu đề"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1 text-left">Chủ đề</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              disabled={catLoading}
            >
              <option value="" disabled>
                Chọn chủ đề...
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1 text-left">Nội dung</label>
            <textarea
              className="w-full border rounded px-3 py-2 min-h-24 resize-y"
              placeholder="Nội dung"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
          {(blog.status === "published" || blog.status === "archived") && (
            <div>
              <label className="block font-medium mb-1 text-left">
                Trạng thái
              </label>
              <select
                className="w-full border rounded px-3 py-2"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
              >
                <option value="published">Đã xuất bản</option>
                <option value="archived">Lưu trữ</option>
              </select>
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Huỷ
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={handleSubmitReview}
              disabled={loading}
            >
              Gửi duyệt
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
