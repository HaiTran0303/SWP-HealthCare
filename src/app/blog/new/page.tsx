"use client";

import { useState, useEffect } from "react";
import { BlogService, Blog } from "@/services/blog.service";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { CategoryService, Category } from "@/services/category.service";
import { useAuth } from "@/contexts/AuthContext";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function BlogNewPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [publishOption, setPublishOption] = useState<string>("draft"); // 'draft', 'publish', 'review'

  const userRole = typeof user?.role === "object" ? user.role.name : user?.role;
  const isAdminOrManager = userRole === "admin" || userRole === "manager";
  const isConsultant = userRole === "consultant";

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
      if (tagArr.length === 0) { // New validation for tags
        setError("Tags không được để trống.");
        setLoading(false);
        return;
      }

      const isAutoPublish = isAdminOrManager && (publishOption === 'publish' || publishOption === 'draft_then_publish');

      const blogPayload: any = {
        authorId: user.id,
        title: title.trim(),
        content: content.trim(),
        categoryId,
        tags: tagArr,
        status: "draft", 
      };

      if (isAutoPublish) {
        blogPayload.autoPublish = true;
      }

      // Ensure all fields are present; rely on backend to handle empty strings/arrays if optional.
      // The previous loop that removed undefined or empty string fields is removed,
      // as the backend might expect them to be present in the payload.

      console.log("Blog create payload (initial):", blogPayload);
      const newBlog = await BlogService.create(blogPayload); // Create blog first

      let featuredImageId: string | null = null;
      if (selectedFile && newBlog?.id) { // If image selected and blog created successfully
        const uploadResponse = await BlogService.uploadBlogImage(selectedFile, newBlog.id); // Use new blog's ID as entityId
        featuredImageId = uploadResponse.id;

        if (featuredImageId) {
          // Update the blog with the featured image ID
          await BlogService.update(newBlog.id, { featuredImage: featuredImageId });
        }
      }

      if (newBlog?.id) {
        if (isConsultant && publishOption === 'review') {
          await BlogService.submitReview(newBlog.id);
        } else if (isAdminOrManager) {
          if (publishOption === 'review') {
            await BlogService.submitReview(newBlog.id);
          } else if (publishOption === 'publish') {
            await BlogService.publish(newBlog.id);
          } else if (publishOption === 'draft_then_publish') {
            await BlogService.directPublish(newBlog.id);
          }
        }
      }

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
          <Label htmlFor="title" className="font-medium">Tiêu đề</Label>
          <input
            id="title"
            className="w-full border rounded px-2 py-1 mt-1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="content" className="font-medium">Nội dung</Label>
          <textarea
            id="content"
            className="w-full border rounded px-2 py-1 mt-1 min-h-[120px]"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="category" className="font-medium">Chủ đề</Label>
          <select
            id="category"
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
          <Label htmlFor="tags" className="font-medium">Tags (phân tách bởi dấu phẩy)</Label>
          <input
            id="tags"
            className="w-full border rounded px-2 py-1 mt-1"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="giới tính, sức khỏe, tư vấn"
          />
        </div>
        <div>
          <Label htmlFor="featuredImage" className="font-medium">Ảnh nổi bật</Label>
          <input
            id="featuredImage"
            type="file"
            className="w-full border rounded px-2 py-1 mt-1"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        {(isAdminOrManager || isConsultant) && (
          <div className="space-y-2">
            <Label className="font-medium">Tùy chọn xuất bản</Label>
            <RadioGroup
              value={publishOption}
              onValueChange={setPublishOption}
              className="flex flex-col space-y-1"
            >
              {isAdminOrManager && (
                <>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="publish" id="option-publish" />
                    <Label htmlFor="option-publish">
                      Tạo blog và Xuất bản ngay lập tức
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="draft_then_publish" id="option-draft-publish" />
                    <Label htmlFor="option-draft-publish">
                      Tạo blog Nháp & Xuất bản trực tiếp
                    </Label>
                  </div>
                </>
              )}
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="review" id="option-review" />
                <Label htmlFor="option-review">
                  {isConsultant ? "Tạo blog Nháp & Gửi duyệt" : "Tạo blog Nháp & Gửi duyệt (theo quy trình duyệt)"}
                </Label>
              </div>
              {!isConsultant && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="draft" id="option-draft" />
                  <Label htmlFor="option-draft">
                    Tạo blog Nháp
                  </Label>
                </div>
              )}
            </RadioGroup>
          </div>
        )}

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
