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
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [relatedServicesIds, setRelatedServicesIds] = useState<string>("");
  const [excerpt, setExcerpt] = useState("");
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

      let initialStatusForCreate: string = "draft"; // Always create as draft initially unless directly published
      let needsDirectPublish: boolean = false;
      let needsExplicitPublish: boolean = false;
      let needsSubmitReview: boolean = false;

      if (isAdminOrManager) {
        if (publishOption === 'publish') {
          initialStatusForCreate = "approved"; // Create as approved, then explicitly publish
          needsExplicitPublish = true;
        } else if (publishOption === 'draft_then_publish') {
          initialStatusForCreate = "draft";
          needsDirectPublish = true; // Will call directPublish later
        } else if (publishOption === 'review') {
          initialStatusForCreate = "pending_review";
          needsSubmitReview = true; // Will call submitReview later
        } else if (publishOption === 'draft') {
          initialStatusForCreate = "draft";
        }
      } else if (isConsultant) {
        if (publishOption === 'review') {
          initialStatusForCreate = "pending_review";
          needsSubmitReview = true;
        } else {
          initialStatusForCreate = "draft";
        }
      }

      const relatedServicesArr = relatedServicesIds
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);

      const blogPayload: any = {
        authorId: user.id,
        title: title.trim(),
        content: content.trim(),
        categoryId,
        tags: tagArr,
        status: initialStatusForCreate, // Set initial status based on selected option
        seoTitle: seoTitle.trim(),
        seoDescription: seoDescription.trim(),
        relatedServicesIds: relatedServicesArr,
        excerpt: excerpt.trim(),
      };

      // Remove autoPublish from payload since we're handling transitions explicitly
      // if (autoPublishFlag) {
      //   blogPayload.autoPublish = true;
      // }

      console.log("Blog create payload:", blogPayload);
      const newBlog = await BlogService.create(blogPayload); // Create blog

      let featuredImageId: string | null = null;
      if (selectedFile && newBlog?.id) {
        // Pass newBlog.id as blogId, and altText (empty string for now)
        const uploadResponse = await BlogService.uploadBlogImage(selectedFile, newBlog.id, "");
        featuredImageId = uploadResponse.id;

        if (featuredImageId) {
          await BlogService.update(newBlog.id, { featuredImage: featuredImageId });
        }
      }

      // Explicitly handle status transitions after creation
      if (newBlog?.id) {
        if (needsSubmitReview) {
          await BlogService.submitReview(newBlog.id);
        } else if (needsDirectPublish) {
          await BlogService.directPublish(newBlog.id);
        } else if (needsExplicitPublish) {
          await BlogService.publish(newBlog.id);
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
        <div>
          <Label htmlFor="seoTitle" className="font-medium">SEO Title</Label>
          <input
            id="seoTitle"
            className="w-full border rounded px-2 py-1 mt-1"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            placeholder="Tiêu đề SEO"
          />
        </div>
        <div>
          <Label htmlFor="seoDescription" className="font-medium">SEO Description</Label>
          <textarea
            id="seoDescription"
            className="w-full border rounded px-2 py-1 mt-1 min-h-[80px]"
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
            placeholder="Mô tả SEO"
          />
        </div>
        <div>
          <Label htmlFor="relatedServicesIds" className="font-medium">Related Services IDs (phân tách bởi dấu phẩy)</Label>
          <input
            id="relatedServicesIds"
            className="w-full border rounded px-2 py-1 mt-1"
            value={relatedServicesIds}
            onChange={(e) => setRelatedServicesIds(e.target.value)}
            placeholder="service-id-1, service-id-2"
          />
        </div>
        <div>
          <Label htmlFor="excerpt" className="font-medium">Excerpt</Label>
          <textarea
            id="excerpt"
            className="w-full border rounded px-2 py-1 mt-1 min-h-[80px]"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Tóm tắt ngắn gọn bài viết"
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
