import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { BlogService, Blog } from "@/services/blog.service";

interface BlogCreateWithImageProps {
  blogId?: string;
}

export default function BlogCreateWithImage({
  blogId: propBlogId,
}: BlogCreateWithImageProps) {
  const [step, setStep] = useState(1);
  const [blogId, setBlogId] = useState(propBlogId || "");
  const [imageId, setImageId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Blog form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  // ...add more fields as needed

  // Image form state
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");

  const [blogImages, setBlogImages] = useState<{ id: string; url: string }[]>(
    []
  );
  const [fetchingImages, setFetchingImages] = useState(false);

  useEffect(() => {
    if (propBlogId) {
      setBlogId(propBlogId);
      setStep(2); // Skip create blog step
    }
  }, [propBlogId]);

  // Fetch blog images if blogId có sẵn
  useEffect(() => {
    if (blogId) {
      setFetchingImages(true);
      BlogService.getById(blogId)
        .then((data: Blog) => {
          if (Array.isArray(data?.images)) setBlogImages(data.images);
          else setBlogImages([]);
        })
        .catch(() => setBlogImages([]))
        .finally(() => setFetchingImages(false));
    }
  }, [blogId, success]); // refetch khi upload/xoá thành công

  // Step 1: Create blog
  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          categoryId,
          status: "draft",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Tạo blog thất bại");
      setBlogId(data.data.id);
      setStep(2);
      setSuccess("Tạo blog thành công!");
    } catch (err: any) {
      setError(err.message || "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Upload image
  const handleUploadImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return setError("Chọn file ảnh!");
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const formData = new FormData();
      formData.append("entityType", "blog");
      formData.append("entityId", blogId);
      formData.append("file", file);
      formData.append("altText", altText);
      formData.append("generateThumbnails", "true");
      formData.append("isPublic", "true");
      const accessToken =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;
      const res = await fetch("/api/files/image", {
        method: "POST",
        body: formData,
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload ảnh thất bại");
      setImageId(data.data.id);
      setStep(3);
      setSuccess("Upload ảnh thành công!");
    } catch (err: any) {
      setError(err.message || "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Attach image to blog
  const handleAttachImage = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/blogs/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blogId, imageId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gắn ảnh thất bại");
      setSuccess("Gắn ảnh vào blog thành công!");
      setStep(4);
    } catch (err: any) {
      setError(err.message || "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  };

  // Xoá ảnh khỏi blog
  const handleDeleteImage = async (imageId: string) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await BlogService.deleteImageFromBlog(blogId, imageId);
      setSuccess("Xoá ảnh thành công!");
      // Refetch images
      const data = await BlogService.getById(blogId);
      setBlogImages(Array.isArray(data?.images) ? data.images : []);
    } catch (err: any) {
      setError(err.message || "Lỗi xoá ảnh");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4">
        {propBlogId ? "Cập nhật ảnh cho Blog" : "Tạo Blog kèm ảnh"}
      </h2>
      {error && <div className="mb-2 text-red-600">{error}</div>}
      {success && <div className="mb-2 text-green-600">{success}</div>}
      {!propBlogId && step === 1 && (
        <form onSubmit={handleCreateBlog} className="space-y-4">
          <Input
            placeholder="Tiêu đề"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Input
            placeholder="Nội dung"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <Input
            placeholder="CategoryId"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          />
          {/* Có thể thêm dropdown chọn category nếu muốn */}
          <Button type="submit" disabled={loading}>
            {loading ? "Đang tạo..." : "Tạo blog"}
          </Button>
        </form>
      )}
      {step === 2 && (
        <form onSubmit={handleUploadImage} className="space-y-4">
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
          />
          <Input
            placeholder="Alt text cho ảnh (tùy chọn)"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Đang upload..." : "Upload ảnh"}
          </Button>
        </form>
      )}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            Đã upload ảnh thành công! Nhấn nút bên dưới để gắn ảnh vào blog.
          </div>
          <Button onClick={handleAttachImage} disabled={loading}>
            {loading ? "Đang gắn..." : "Gắn ảnh vào blog"}
          </Button>
        </div>
      )}
      {step === 4 && (
        <div className="text-green-700 font-semibold">
          Hoàn tất! Blog đã có ảnh.
        </div>
      )}
      {propBlogId && (
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Ảnh hiện tại của blog:</h4>
          {fetchingImages ? (
            <div>Đang tải ảnh...</div>
          ) : blogImages.length === 0 ? (
            <div>Chưa có ảnh nào.</div>
          ) : (
            <div className="flex flex-wrap gap-4">
              {blogImages.map((img) => (
                <div
                  key={img.id}
                  className="relative w-28 h-28 border rounded overflow-hidden flex flex-col items-center justify-center"
                >
                  {img.url ? (
                    <img
                      src={img.url}
                      alt="Blog image"
                      className="object-cover w-full h-20"
                    />
                  ) : null}
                  <Button
                    size="sm"
                    variant="destructive"
                    className="mt-1"
                    disabled={loading}
                    onClick={() => handleDeleteImage(img.id)}
                  >
                    Xoá
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
