import { apiClient } from "./api";
import { API_ENDPOINTS, API_BASE_URL } from "@/config/api";

export interface Blog {
  id: string;
  title: string;
  content: string;
  status: string;
  categoryId: string;
  tags: (string | { id: string; name: string; slug?: string })[];
  authorId: string;
  author: string; // Add author field
  createdAt: string;
  updatedAt: string;
  category?: { id: string; name: string; slug?: string };
  coverImage?: string;
  featuredImage?: string;
  images?: { id: string; url: string; [key: string]: any }[];
  imageUrl?: string; // Add imageUrl to the Blog interface
  rejectionReason?: string;
  revisionNotes?: string;
  autoPublish?: boolean; // Add autoPublish property
  views?: number;
  seoTitle?: string;
  seoDescription?: string;
  relatedServicesIds?: string[];
  excerpt?: string;
}

interface UploadImageResponse {
  id: string;
  url: string;
  // Add other properties if available in the API response
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
    return apiClient.post<Blog>(API_ENDPOINTS.BLOG.BASE, data);
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
  async attachImageToBlog(blogId: string, imageId: string) {
    return apiClient.post(`${API_ENDPOINTS.BLOG.BASE}/image`, {
      blogId,
      imageId,
    });
  },
  async getImageAccessUrl(imageId: string) {
    return apiClient.get<{ url: string }>(API_ENDPOINTS.FILES.GET_IMAGE(imageId));
  },
  async deleteImageFromBlog(blogId: string, imageId: string) {
    return apiClient.put(`${API_ENDPOINTS.BLOG.BASE}/image`, {
      blogId,
      imageId,
    });
  },

  async synchronizeImageToBlog(imageId: string, data: Record<string, any>) {
    return apiClient.patch(`${API_ENDPOINTS.BLOG.BASE}/image/${imageId}`, data);
  },
  async getPendingReview(params: Record<string, any> = {}) {
    const query = new URLSearchParams({
      ...params,
      status: "pending_review",
      limit: String(params.limit || 1000), // Ensure all pending blogs are fetched
      page: String(params.page || 1),     // Start from the first page
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

  async uploadBlogImage(file: File, blogId: string, altText?: string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("entityType", "blog");
    formData.append("entityId", blogId);
    if (altText) {
      formData.append("altText", altText);
    }
    formData.append("generateThumbnails", "true");
    formData.append("isPublic", "true");

    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.FILES.UPLOAD_IMAGE}`, {
      method: 'POST',
      body: formData,
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to upload image');
    }
    return data;
  },
};
