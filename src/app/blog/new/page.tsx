"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { BlogService, CreateBlogData } from "@/services/blog.service";
import { Category, CategoryService } from "@/services/category.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";

export default function CreateBlogPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await CategoryService.getAllCategories();
        if (fetchedCategories) {
          setCategories(fetchedCategories);
        }
      } catch (err) {
        setError("Không thể tải danh mục.");
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách danh mục.",
          variant: "destructive",
        });
      }
    };
    fetchCategories();
  }, [toast]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const tagsArray = tags.split(",").map((tag) => tag.trim()).filter(Boolean);

    if (!title || !content || !selectedCategory || tagsArray.length === 0) {
      toast({
        title: "Lỗi",
        description:
          "Vui lòng điền đầy đủ các trường: Tiêu đề, Nội dung, Thẻ và chọn ít nhất một Danh mục.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Lỗi",
        description: "Bạn cần đăng nhập để tạo bài viết.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    setLoading(true);

    const isManagerOrAdmin = Boolean(
      user.role &&
        ['ADMIN', 'MANAGER'].includes(
          (typeof user.role === 'string'
            ? user.role
            : user.role.name || ''
          ).toUpperCase()
        )
    );

    const blogStatus = isManagerOrAdmin ? "published" : "pending_review"; // Set status based on role

    const payload: CreateBlogData = {
      title,
      content,
      authorId: user.id,
      tags: tagsArray,
      categoryId: selectedCategory,
      status: blogStatus, // Use the determined status
      autoPublish: isManagerOrAdmin, // autoPublish is true only for Admin/Manager
      seoTitle: seoTitle || title, // Fallback to title if seoTitle is empty
      seoDescription: seoDescription,
      excerpt: excerpt,
      featuredImage: "",
      relatedServicesIds: [],
    };

    try {
      console.log("Submitting blog with payload:", payload);
      await BlogService.create(payload);

      toast({
        title: "Thành công!",
        description: isManagerOrAdmin
          ? "Đã tạo và xuất bản blog mới thành công."
          : "Đã tạo blog mới thành công và gửi đi duyệt.",
      });

      router.push(`/?blogSubmitted=true`);

    } catch (err: any) {
      console.error("Failed to create blog:", err.response?.data || err);
      const errorMessage =
        err.response?.data?.message || "Tạo blog thất bại. Vui lòng thử lại.";
      setError(errorMessage);
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Tạo Blog Mới</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="title">Tiêu đề</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nhập tiêu đề blog..."
            required
            disabled={loading}
          />
        </div>
        <div>
          <Label htmlFor="content">Nội dung</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Viết nội dung blog ở đây..."
            required
            rows={10}
            disabled={loading}
          />
        </div>
        <div>
          <Label htmlFor="tags">Thẻ (cách nhau bởi dấu phẩy)</Label>
          <Input
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="ví dụ: sức khỏe, dinh dưỡng, thể thao"
            required
            disabled={loading}
          />
        </div>
        <div>
          <Label htmlFor="excerpt">Đoạn trích</Label>
          <Textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Viết một đoạn trích ngắn gọn..."
            rows={3}
            disabled={loading}
          />
        </div>
        <div>
          <Label htmlFor="seoTitle">Tiêu đề SEO</Label>
          <Input
            id="seoTitle"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            placeholder="Nhập tiêu đề SEO..."
            disabled={loading}
          />
        </div>
        <div>
          <Label htmlFor="seoDescription">Mô tả SEO</Label>
          <Textarea
            id="seoDescription"
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
            placeholder="Nhập mô tả SEO..."
            rows={3}
            disabled={loading}
          />
        </div>
        <div>
          <Label>Danh mục</Label>
          <RadioGroup
            value={selectedCategory}
            onValueChange={handleCategoryChange}
            className="space-y-2 mt-2"
            disabled={loading}
          >
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <RadioGroupItem value={category.id} id={category.id} />
                <Label htmlFor={category.id} className="font-normal">
                  {category.name}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        
        {error && <p className="text-red-500">{error}</p>}
        
        <Button type="submit" disabled={loading}>
          {loading ? "Đang tạo..." : "Tạo Blog"}
        </Button>
      </form>
    </div>
  );
}
