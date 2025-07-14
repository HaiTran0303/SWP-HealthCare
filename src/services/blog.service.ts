import { apiClient } from "./api";
import { API_ENDPOINTS } from "@/config/api";

export interface Blog {
  id: string;
  title: string;
  content: string;
  status: string;
  categoryId: string;
  tags: (string | { id: string; name: string; slug?: string })[];
  authorId: string;
  createdAt: string;
  updatedAt: string;
  category?: { id: string; name: string; slug?: string };
  coverImage?: string;
  featuredImage?: string;
  images?: { id: string; url: string; [key: string]: any }[];
  imageUrl?: string; // Add imageUrl to the Blog interface
  rejectionReason?: string;
  revisionNotes?: string;
  // ... các trường khác nếu cần
}

export const BlogService = {
  async getAll(params: Record<string, any> = {}) {
    const query = new URLSearchParams(params).toString();
    return apiClient.get<Blog[]>(
      `${API_ENDPOINTS.BLOG.BASE}${query ? `?${query}` : ""}`
    );
  },
  async getById(id: string) {
    return apiClient.get<Blog>(`${API_ENDPOINTS.BLOG.BASE}/${id}`);
  },
  async create(data: Partial<Blog>) {
    return apiClient.post(API_ENDPOINTS.BLOG.BASE, data);
  },
  async update(id: string, data: Partial<Blog>) {
    return apiClient.patch(`${API_ENDPOINTS.BLOG.BASE}/${id}`, data);
  },
  async submitReview(id: string) {
    return apiClient.patch(`${API_ENDPOINTS.BLOG.BASE}/${id}/submit-review`);
  },
  async review(
    id: string,
    data: { status: string; rejectionReason?: string; revisionNotes?: string }
  ) {
    return apiClient.patch(`${API_ENDPOINTS.BLOG.BASE}/${id}/review`, data);
  },
  async publish(id: string, data?: { publishNotes?: string }) {
    return apiClient.patch(`${API_ENDPOINTS.BLOG.BASE}/${id}/publish`, data);
  },
  async directPublish(id: string) {
    return apiClient.patch(`${API_ENDPOINTS.BLOG.BASE}/${id}/direct-publish`);
  },
  async archive(id: string) {
    return apiClient.patch(`${API_ENDPOINTS.BLOG.BASE}/${id}/archive`);
  },
  async getPublished() {
    return apiClient.get<Blog[]>(`${API_ENDPOINTS.BLOG.BASE}/published`);
  },
  async deleteImageFromBlog(blogId: string, imageId: string) {
    return apiClient.put(`${API_ENDPOINTS.BLOG.BASE}/image`, {
      blogId,
      imageId,
    });
  },
  async getPendingReview(params: Record<string, any> = {}) {
    const query = new URLSearchParams({
      ...params,
      status: "pending_review",
    }).toString();
    return apiClient.get<Blog[]>(
      `${API_ENDPOINTS.BLOG.BASE}${query ? `?${query}` : ""}`
    );
  },
  async getApproved(params: Record<string, any> = {}) {
    const query = new URLSearchParams({
      ...params,
      status: "approved",
    }).toString();
    return apiClient.get<Blog[]>(
      `${API_ENDPOINTS.BLOG.BASE}${query ? `?${query}` : ""}`
    );
  },
  async delete(id: string) {
    return apiClient.delete(`${API_ENDPOINTS.BLOG.BASE}/${id}`);
  },
};

export async function updateBlog(id: string, data: any) {
  const accessToken =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const res = await fetch(`https://gender-healthcare.org/blogs/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Cập nhật blog thất bại");
  return result.data;
}
