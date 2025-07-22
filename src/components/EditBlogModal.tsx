import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { BlogService, Blog } from "@/services/blog.service";
import { CategoryService, Category } from "@/services/category.service";

interface EditBlogModalProps {
  blog: Blog; // Use Blog interface for better type safety
  onClose: () => void;
  onSuccess?: () => void;
}

const STATUS_OPTIONS = [
  { value: "draft", label: "Nháp" },
  { value: "pending_review", label: "Chờ duyệt" },
  { value: "needs_revision", label: "Cần chỉnh sửa" },
  { value: "rejected", label: "Bị từ chối" },
  { value: "approved", label: "Đã duyệt" },
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
  const [tags, setTags] = useState(blog.tags?.map((tag: any) => typeof tag === 'object' ? tag.name : tag).join(", ") || "");
  const [seoTitle, setSeoTitle] = useState(blog.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(blog.seoDescription || "");
  const [relatedServicesIds, setRelatedServicesIds] = useState(blog.relatedServicesIds?.join(", ") || "");
  const [excerpt, setExcerpt] = useState(blog.excerpt || "");
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
      const tagArr = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const relatedServicesArr = relatedServicesIds
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);

      const updateData: Partial<Blog> = {
        title: title.trim(),
        content: content.trim(),
        categoryId,
        tags: tagArr,
        status: status, // Always include status as it's a controlled field
        seoTitle: seoTitle.trim(),
        seoDescription: seoDescription.trim(),
        relatedServicesIds: relatedServicesArr,
        excerpt: excerpt.trim(),
      };

      await BlogService.update(blog.id, updateData);
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
          <div>
            <label className="block font-medium mb-1 text-left">Tags (phân tách bởi dấu phẩy)</label>
            <Input
              placeholder="giới tính, sức khỏe, tư vấn"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-medium mb-1 text-left">SEO Title</label>
            <Input
              placeholder="Tiêu đề SEO"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-medium mb-1 text-left">SEO Description</label>
            <textarea
              className="w-full border rounded px-3 py-2 min-h-24 resize-y"
              placeholder="Mô tả SEO"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-medium mb-1 text-left">Related Services IDs (phân tách bởi dấu phẩy)</label>
            <Input
              placeholder="service-id-1, service-id-2"
              value={relatedServicesIds}
              onChange={(e) => setRelatedServicesIds(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-medium mb-1 text-left">Excerpt</label>
            <textarea
              className="w-full border rounded px-3 py-2 min-h-24 resize-y"
              placeholder="Tóm tắt ngắn gọn bài viết"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
            />
          </div>
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
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
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
