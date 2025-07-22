"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { BlogService, Blog } from "@/services/blog.service";
import { useAuth } from "@/contexts/AuthContext";

interface BlogCreateWithImageProps {
  blogId: string; // blogId is now required
  onImageUploaded?: () => void; // Callback to notify parent on image upload/attachment
}

export default function BlogCreateWithImage({
  blogId,
  onImageUploaded,
}: BlogCreateWithImageProps) {
  const [step, setStep] = useState(1); // 1: Upload image, 2: Attach image
  const [imageId, setImageId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { user } = useAuth();

  // Image form state
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");

  const [blogImages, setBlogImages] = useState<{ id: string; url: string }[]>(
    []
  );
  const [fetchingImages, setFetchingImages] = useState(false);

  // Helper function to get image access URL
  const getImageAccessUrl = async (imageId: string): Promise<string | null> => {
    try {
      const response = await BlogService.getImageAccessUrl(imageId); // Assuming this method exists or will be added
      return response.url;
    } catch (error) {
      console.error(`Error fetching access URL for image ${imageId}:`, error);
      return null;
    }
  };

  // Fetch blog images if blogId is available
  useEffect(() => {
    if (blogId) {
      setFetchingImages(true);
      BlogService.getById(blogId)
        .then(async (data: Blog) => {
          if (Array.isArray(data?.images)) {
            const imagesWithUrls = await Promise.all(
              data.images.map(async (img) => {
                const url = await getImageAccessUrl(img.id);
                return { ...img, url: url || "" }; // Ensure url is always a string
              })
            );
            setBlogImages(imagesWithUrls.filter(img => img.url)); // Filter out images that failed to get a URL
            console.log("Fetched blog images with URLs:", imagesWithUrls);
          } else {
            setBlogImages([]);
          }
        })
        .catch((err) => {
          console.error("Error fetching blog images:", err);
          setBlogImages([]);
        })
        .finally(() => setFetchingImages(false));
    }
  }, [blogId, success]); // refetch when upload/delete is successful

  // Step 1: Upload image
  const handleUploadImage = async (e: React.FormEvent) => {
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
      // Pass the blogId prop to uploadBlogImage
      const uploadResponse = await BlogService.uploadBlogImage(file, blogId, altText);
      console.log("Image upload response:", uploadResponse); // Log upload response
      if (uploadResponse && uploadResponse.data && uploadResponse.data.id) {
        setImageId(uploadResponse.data.id); // Safely extract imageId from nested 'data' object
      } else {
        throw new Error("Invalid upload response: Missing image ID.");
      }
      setStep(2); // Move to attach step
      setSuccess("Upload ảnh thành công!");
    } catch (err: any) {
      // Check if it's an ApiError and extract a more specific message
      if (err && typeof err === 'object' && err.name === 'ApiError' && err.message) {
        setError(err.message);
      } else {
        setError(err?.message || "Lỗi không xác định khi gắn ảnh vào blog.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Attach image to blog
  const handleAttachImage = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      console.log("Attempting to attach image:", { blogId, imageId });
      // Use the new attachImageToBlog method
      await BlogService.attachImageToBlog(blogId, imageId);
      setSuccess("Gắn ảnh vào blog thành công!");
      if (onImageUploaded) {
        onImageUploaded(); // Notify parent component
      }
      // Re-fetch images after attachment and update with URLs
      const data = await BlogService.getById(blogId);
      if (Array.isArray(data?.images)) {
        const imagesWithUrls = await Promise.all(
          data.images.map(async (img) => {
            const url = await getImageAccessUrl(img.id);
            return { ...img, url: url || "" };
          })
        );
        setBlogImages(imagesWithUrls.filter(img => img.url));
        console.log("Blog images after attachment:", imagesWithUrls.filter(img => img.url)); // Log the images
      } else {
        setBlogImages([]);
        console.log("No images found for blog after attachment.");
      }
      setFile(null); // Clear selected file
      setAltText(""); // Clear alt text
      setStep(1); // Reset to upload new image
    } catch (err: any) {
      setError(err?.message || "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  };

  // Delete image from blog
  const handleDeleteImage = async (imageId: string) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await BlogService.deleteImageFromBlog(blogId, imageId);
      setSuccess("Xoá ảnh thành công!");
      if (onImageUploaded) {
        onImageUploaded(); // Notify parent component
      }
      // Refetch images and update with URLs
      const data = await BlogService.getById(blogId);
      if (Array.isArray(data?.images)) {
        const imagesWithUrls = await Promise.all(
          data.images.map(async (img) => {
            const url = await getImageAccessUrl(img.id);
            return { ...img, url: url || "" };
          })
        );
        setBlogImages(imagesWithUrls.filter(img => img.url));
      } else {
        setBlogImages([]);
      }
    } catch (err: any) {
      setError(err?.message || "Lỗi xoá ảnh");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4">
        Cập nhật ảnh cho Blog
      </h2>
      {error && <div className="mb-2 text-red-600">{error}</div>}
      {success && <div className="mb-2 text-green-600">{success}</div>}

      {step === 1 && ( // Step 1: Upload new image
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

      {step === 2 && ( // Step 2: Attach uploaded image to blog
        <div className="space-y-4">
          <div>
            Đã upload ảnh thành công! Nhấn nút bên dưới để gắn ảnh vào blog.
          </div>
          <Button onClick={handleAttachImage} disabled={loading}>
            {loading ? "Đang gắn..." : "Gắn ảnh vào blog"}
          </Button>
        </div>
      )}

      <div className="mb-4 mt-6">
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
    </div>
  );
}
