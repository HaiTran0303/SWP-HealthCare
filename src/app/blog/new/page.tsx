"use client";

import { useState, useEffect } from "react";
import { BlogService } from "@/services/blog.service";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { CategoryService, Category } from "@/services/category.service";
import { useAuth } from "@/contexts/AuthContext";

export default function BlogNewPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState("");
  const [autoPublish, setAutoPublish] = useState(false); // Chỉ Admin/Manager mới thấy
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedImageId, setUploadedImageId] = useState<string | null>(null);

  // TODO: Lấy role từ AuthContext
  const canAutoPublish = true; // Thay bằng kiểm tra role thực tế

  useEffect(() => {
    CategoryService.getAllCategories()
      .then((data: any) => {
        if (Array.isArray(data)) {
          setCategories(data);
        } else if (Array.isArray(data?.data)) {
          setCategories(data.data);
        } else {
          setCategories([]);
        }
      })
      .catch(() => setCategories([]));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (!user?.id) {
      setError("Không xác định được người dùng. Vui lòng đăng nhập lại.");
      setLoading(false);
      return;
    }
    try {
      let featuredImageId: string | null = null;
      if (selectedFile) {
        // Upload image first
        const uploadResponse = await BlogService.uploadBlogImage(selectedFile, user.id);
        featuredImageId = uploadResponse.id; // Assuming the response contains the ID of the uploaded image
      }

      const tagArr = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (!categoryId) {
        setError("Bạn phải chọn chủ đề.");
        setLoading(false);
        return;
      }
      if (!title.trim() || !content.trim()) {
        setError("Tiêu đề và nội dung không được để trống.");
        setLoading(false);
        return;
      }
      const payload: any = {
        authorId: user.id,
        title: title.trim(),
        content: content.trim(),
        categoryId,
        tags: tagArr,
        status: "draft",
      };
      if (featuredImageId) {
        payload.featuredImage = featuredImageId;
      }
      if (canAutoPublish && autoPublish) payload.autoPublish = true;
      Object.keys(payload).forEach(
        (key) =>
          (payload[key] === undefined || payload[key] === "") &&
          key !== "tags" &&
          delete payload[key]
      );
      console.log("Blog create payload:", payload);
      await BlogService.create(payload);
      router.push("/blog");
    } catch (err: any) {
      const detail = Array.isArray(err?.error?.message)
        ? err.error.message.join(", ")
        : err?.error?.message || err?.message || "Đã có lỗi xảy ra";
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Tạo blog mới</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="font-medium">Tiêu đề</label>
          <input
            className="w-full border rounded px-2 py-1 mt-1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="font-medium">Nội dung</label>
          <textarea
            className="w-full border rounded px-2 py-1 mt-1 min-h-[120px]"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="font-medium">Chủ đề</label>
          <select
            className="w-full border rounded px-2 py-1 mt-1"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            <option value="">Chọn chủ đề</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="font-medium">Tags (phân tách bởi dấu phẩy)</label>
          <input
            className="w-full border rounded px-2 py-1 mt-1"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="giới tính, sức khỏe, tư vấn"
          />
        </div>
        {canAutoPublish && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoPublish}
              onChange={(e) => setAutoPublish(e.target.checked)}
              id="autoPublish"
            />
            <label htmlFor="autoPublish">
              Tự động xuất bản (chỉ Admin/Manager)
            </label>
          </div>
        )}
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <div>
          <label className="font-medium">Ảnh nổi bật</label>
          <input
            type="file"
            className="w-full border rounded px-2 py-1 mt-1"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? "Đang lưu..." : "Tạo blog"}
          </Button>
        </div>
      </form>
    </div>
  );
}
