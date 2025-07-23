"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Blog, BlogService } from "@/services/blog.service";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function BlogListPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    setLoading(true);
    BlogService.getPublished()
      .then((res: any) => {
        const blogData = res.data?.data || res.data || [];
        if (!Array.isArray(blogData)) {
          console.error("Expected blogData to be an array but got:", blogData);
          setBlogs([]);
          return;
        }
        const blogsWithImages = blogData.map((blog: any) => {
          const image = blog.images?.[0];
          return {
            ...blog,
            imageUrl: image?.url || null,
          };
        });
        setBlogs(blogsWithImages);
      })
      .catch((error) => {
        console.error("Error fetching blogs:", error);
        setBlogs([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Debug log
  console.log("user:", user);
  console.log("user.role:", user?.role);
  // Role check
  let roleName = "";
  if (
    user?.role &&
    typeof user.role === "object" &&
    typeof user.role.name === "string"
  ) {
    roleName = user.role.name.toLowerCase();
  }
  const canManage = ["admin", "manager", "consultant"].includes(roleName);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-primary drop-shadow-sm tracking-tight">
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Tất cả bài viết
          </span>
        </h1>
        {canManage && (
          <Link href={roleName === "consultant" ? "/blog/new" : "/blog/manage"}>
            <Button>
              {roleName === "consultant" ? "Thêm bài viết" : "Quản lý blog"}
            </Button>
          </Link>
        )}
      </div>
      {loading || authLoading ? (
        <div>Đang tải...</div>
      ) : blogs.length === 0 ? (
        <div>Không có blog nào.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => {
            return (
              <Link
                key={blog.id}
                href={`/blog/${blog.id}`}
                className="block border rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="h-36 w-full bg-gradient-to-br from-secondary/10 to-primary/10 dark:from-secondary/20 dark:to-primary/20 rounded-xl flex items-center justify-center mb-2 overflow-hidden relative">
                  {blog.imageUrl ? (
                    <Image
                      src={blog.imageUrl}
                      alt={blog.title}
                      fill
                      className="object-cover w-full h-full rounded-xl"
                      onError={(e:any) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-5xl text-primary/60">📰</span>
                  )}
                </div>
                <h2 className="text-xl font-semibold mb-2">{blog.title}</h2>
                <div className="text-gray-500 text-sm mb-1">
                  Tác giả: {blog.authorId}
                </div>
                <div className="text-gray-400 text-xs">
                  Ngày tạo: {new Date(blog.createdAt).toLocaleString()}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
