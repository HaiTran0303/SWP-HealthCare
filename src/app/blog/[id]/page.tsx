"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { Blog, BlogService } from "@/services/blog.service";
import { CategoryService, Category } from "@/services/category.service";
import { Button } from "@/components/ui/button";

export default function BlogDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewStatus, setReviewStatus] = useState("");
  const [reviewReason, setReviewReason] = useState("");
  const [categoryName, setCategoryName] = useState<string>("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    BlogService.getById(id)
      .then((res: any) => {
        const blogData = res.data?.data || res.data || res;
        const image = blogData.images?.[0];
        const imageUrl = image?.url || null;
        setBlog({ ...blogData, imageUrl });

        // Try to get category name if available
        if (blogData.categoryId) {
          CategoryService.getCategoryById(blogData.categoryId)
            .then((cat: Category) => setCategoryName(cat.name))
            .catch(() => setCategoryName(blogData.categoryId));
        }
      })
      .catch((error) => {
        console.error("Error fetching blog:", error);
        setError("Không tìm thấy blog");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmitReview = async () => {
    if (!blog) return;
    setActionLoading(true);
    try {
      await BlogService.submitReview(blog.id);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Lỗi gửi duyệt");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDirectPublish = async () => {
    if (!blog) return;
    setActionLoading(true);
    try {
      await BlogService.directPublish(blog.id);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Lỗi publish trực tiếp");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!blog) return;
    setActionLoading(true);
    try {
      await BlogService.publish(blog.id);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Lỗi publish");
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!blog) return;
    setActionLoading(true);
    try {
      await BlogService.archive(blog.id);
      router.push("/blog");
    } catch (err: any) {
      setError(err?.message || "Lỗi archive");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReview = async () => {
    if (!blog) return;
    setActionLoading(true);
    try {
      await BlogService.review(blog.id, {
        status: reviewStatus,
        ...(reviewStatus === "REJECTED" && { rejectionReason: reviewReason }),
        ...(reviewStatus === "NEEDS_REVISION" && {
          revisionNotes: reviewReason,
        }),
      });
      setShowReviewDialog(false);
      setReviewReason("");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Lỗi review");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-8">Đang tải...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!blog) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Image section (takes full width on small screens, 1/2 on medium and up) */}
        <div className="w-full md:w-1/2">
          {blog.imageUrl ? (
            <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden shadow-lg">
              <Image
                src={blog.imageUrl}
                alt={blog.title}
                fill
                className="object-cover"
                onError={(e: any) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className="w-full h-64 md:h-80 flex items-center justify-center bg-gray-100 rounded-lg shadow-lg">
              <span className="text-8xl text-primary/40">📰</span>
            </div>
          )}
        </div>
        {/* Content section (takes full width on small screens, 1/2 on medium and up) */}
        <div className="w-full md:w-1/2 flex flex-col">
          <div className="bg-white dark:bg-card/80 rounded-lg shadow-lg p-6 flex-1">
            <h1 className="text-3xl font-bold mb-4 text-primary leading-tight">
              {blog.title}
            </h1>
            <div className="mb-6 text-sm font-medium text-gray-600">
              Chủ đề: {categoryName}
            </div>
            <div className="prose prose-lg max-w-none text-gray-800 dark:text-gray-200 leading-relaxed">
              {/* Render HTML content directly if blog.content is HTML */}
              <div dangerouslySetInnerHTML={{ __html: blog.content }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
