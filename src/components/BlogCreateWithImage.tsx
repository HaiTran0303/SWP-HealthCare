"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { BlogService, Blog } from "@/services/blog.service";
import { useAuth } from "@/contexts/AuthContext";
interface BlogCreateWithImageProps {
  blogId: string;
  onImageUploaded?: () => void;
}

export default function BlogCreateWithImage({
  blogId,
  onImageUploaded,
}: BlogCreateWithImageProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { user } = useAuth();

  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [currentImages, setCurrentImages] = useState<any[]>([]);
  const [fetchingImages, setFetchingImages] = useState(false);

  const fetchBlogImages = () => {
    if (blogId) {
      setFetchingImages(true);
      BlogService.getById(blogId)
        .then((data: Blog) => {
          setCurrentImages(data.images || []);
        })
        .catch((err) => {
          console.error("Error fetching blog details:", err);
          setCurrentImages([]);
        })
        .finally(() => setFetchingImages(false));
    }
  };

  useEffect(() => {
    fetchBlogImages();
  }, [blogId]);

  const handleUploadAndAttachImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Chọn file ảnh!");
      return;
    }
    if (!user?.id) {
      setError("Không xác định được người dùng. Vui lòng đăng nhập lại.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const uploadResponse = await BlogService.uploadBlogImage(
        file,
        blogId,
        altText
      );
      if (uploadResponse && uploadResponse.data && uploadResponse.data.id) {
        const imageId = uploadResponse.data.id;
        await BlogService.attachImageToBlog(blogId, imageId);
        setSuccess("Upload và gắn ảnh vào blog thành công!");
        fetchBlogImages(); // Refresh the image list
        if (onImageUploaded) {
          onImageUploaded();
        }
        setFile(null);
        setAltText("");
      } else {
        throw new Error(
          "Invalid upload response: Missing image ID in data object."
        );
      }
    } catch (err: any) {
      setError(err?.message || "Lỗi không xác định khi tải lên hoặc gắn ảnh.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await BlogService.deleteImageFromBlog(blogId, imageId);
      setSuccess("Xoá ảnh thành công!");
      fetchBlogImages(); // Refresh the image list
      if (onImageUploaded) {
        onImageUploaded();
      }
    } catch (err: any) {
      setError(err?.message || "Lỗi xoá ảnh");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4">Cập nhật ảnh cho Blog</h2>
      {error && <div className="mb-2 text-red-600">{error}</div>}
      {success && <div className="mb-2 text-green-600">{success}</div>}

      <form onSubmit={handleUploadAndAttachImage} className="space-y-4">
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
          {loading ? "Đang xử lý..." : "Upload và Gắn ảnh"}
        </Button>
      </form>

      <div className="mb-4 mt-6">
        <h4 className="font-semibold mb-2">Ảnh hiện tại:</h4>
        {fetchingImages ? (
          <div>Đang tải ảnh...</div>
        ) : currentImages.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {currentImages.map((image) => (
              <div
                key={image.id}
                className="relative w-full h-32 border rounded overflow-hidden"
              >
                <img
                  src={image.url}
                  alt={image.altText || "Blog image"}
                  className="object-cover w-full h-full"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute bottom-1 right-1"
                  disabled={loading}
                  onClick={() => handleDeleteImage(image.id)}
                >
                  Xoá
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div>Chưa có ảnh nào.</div>
        )}
      </div>
    </div>
  );
}
