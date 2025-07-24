"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { BlogService, Blog } from "@/services/blog.service";
import { useAuth } from "@/contexts/AuthContext";
import { UpdateBlogDto } from "@/types/api.d";

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
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null); // New state for uploaded image URL
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { user } = useAuth();

  // Image form state
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [currentFeaturedImageUrl, setCurrentFeaturedImageUrl] = useState<string | null>(null); // State for current featured image URL

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

  // Fetch blog details and featured image if blogId is available
  useEffect(() => {
    if (blogId) {
      setFetchingImages(true);
      BlogService.getById(blogId)
        .then(async (data: Blog) => {
          if (data?.featuredImage) {
            setCurrentFeaturedImageUrl(data.featuredImage);
            console.log("Fetched blog featured image:", data.featuredImage); // Debug log
          } else {
            setCurrentFeaturedImageUrl(null);
            console.log("No featured image found for blog."); // Debug log
          }
          // If there are other images (not featured), you might want to handle them here too.
          // For now, focusing only on featuredImage.
        })
        .catch((err) => {
          console.error("Error fetching blog details:", err);
          setCurrentFeaturedImageUrl(null);
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
      console.log("Image upload raw response:", uploadResponse); // Log raw upload response
      if (uploadResponse && uploadResponse.data && uploadResponse.data.id) { // Check for nested data object and ID
        setImageId(uploadResponse.data.id);
        // Get the actual public access URL for the uploaded image
        const publicImageUrl = await BlogService.getImageAccessUrl(uploadResponse.data.id);
        if (publicImageUrl) {
          setUploadedImageUrl(publicImageUrl.url); // Store the public URL
          console.log("Uploaded image public URL:", publicImageUrl.url); // Debug log
        } else {
          throw new Error("Failed to get public URL for uploaded image.");
        }
      } else {
        throw new Error("Invalid upload response: Missing image ID in data object.");
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
      if (!uploadedImageUrl) {
        setError("Không có URL ảnh để gắn.");
        return;
      }

      console.log("Attempting to set featured image:", { blogId, uploadedImageUrl });
      const updatePayload: UpdateBlogDto = {
        featuredImage: uploadedImageUrl,
      };
      await BlogService.update(blogId, updatePayload); // Update the blog's featuredImage field

      setSuccess("Gắn ảnh nổi bật vào blog thành công!");
      setCurrentFeaturedImageUrl(uploadedImageUrl); // Update local state for display
      console.log("Current featured image URL after attach:", uploadedImageUrl); // Debug log

      if (onImageUploaded) {
        onImageUploaded(); // Notify parent component
      }

      setFile(null); // Clear selected file
      setAltText(""); // Clear alt text
      setUploadedImageUrl(null); // Clear uploaded URL
      setImageId(""); // Clear image ID
      setStep(1); // Reset to upload new image
    } catch (err: any) {
      setError(err?.message || "Lỗi không xác định khi gắn ảnh vào blog.");
    } finally {
      setLoading(false);
    }
  };

  // Delete featured image from blog
  const handleDeleteFeaturedImage = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      // To "delete" the featured image, we update the blog to set featuredImage to null/empty string
      const updatePayload: UpdateBlogDto = {
        featuredImage: "", // Set to empty string to remove featured image
      };
      await BlogService.update(blogId, updatePayload);
      setSuccess("Xoá ảnh nổi bật thành công!");
      setCurrentFeaturedImageUrl(null); // Clear local state

      // Optionally, if the image file itself needs to be deleted from storage,
      // you would call a separate API endpoint for that using the imageId.
      // For now, we are only unlinking it as the featured image.

      if (onImageUploaded) {
        onImageUploaded(); // Notify parent component
      }
    } catch (err: any) {
      setError(err?.message || "Lỗi xoá ảnh nổi bật");
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
        <h4 className="font-semibold mb-2">Ảnh nổi bật hiện tại:</h4>
        {fetchingImages ? (
          <div>Đang tải ảnh...</div>
        ) : currentFeaturedImageUrl ? (
          <div className="relative w-48 h-32 border rounded overflow-hidden flex flex-col items-center justify-center">
            <img
              src={currentFeaturedImageUrl}
              alt="Ảnh nổi bật của blog"
              className="object-cover w-full h-full"
            />
            <Button
              size="sm"
              variant="destructive"
              className="absolute bottom-1 right-1"
              disabled={loading}
              onClick={handleDeleteFeaturedImage}
            >
              Xoá ảnh
            </Button>
          </div>
        ) : (
          <div>Chưa có ảnh nổi bật nào.</div>
        )}
      </div>
    </div>
  );
}
