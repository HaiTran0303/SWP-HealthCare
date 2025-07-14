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
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-14 items-center md:items-stretch">
        {/* Image section */}
        <div className="flex-shrink-0 w-full md:w-[520px] flex justify-center md:justify-start">
          {blog.imageUrl ? (
            <Image
              src={blog.imageUrl}
              alt={blog.title}
              fill
              className="rounded-3xl shadow-2xl object-cover w-full md:w-[520px] h-[320px] md:h-[420px] relative"
              onError={(e:any) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-[320px] md:w-[520px] md:h-[420px] flex items-center justify-center bg-gray-100 rounded-3xl">
              <span className="text-8xl text-primary/40">📰</span>
            </div>
          )}
        </div>
        {/* Content section */}
        <div className="flex-1 flex items-center">
          <div className="w-full bg-white dark:bg-card/80 rounded-3xl shadow-xl p-10 flex flex-col justify-center min-h-[320px] md:min-h-[420px]">
            <h1 className="text-4xl font-extrabold mb-6 text-primary leading-tight">
              {blog.title}
            </h1>
            <div className="mb-8 text-base font-medium text-gray-600">
              Chủ đề: {categoryName}
            </div>
            <div className="prose max-w-none text-lg leading-relaxed">
              <h2 className="text-xl font-semibold mb-2">Nội dung</h2>
              {blog.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
