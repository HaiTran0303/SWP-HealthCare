import { apiClient } from "./api";
import { API_ENDPOINTS, API_BASE_URL } from "@/config/api";
import {
  ReviewBlogDto,
  PublishBlogDto,
  UpdateBlogDto,
  BlogQueryParams,
  PaginationResponse,
} from "@/types/api.d";

export interface Blog {
  id: string;
  title: string;
  content: string;
  status: string;
  categoryId: string;
  tags: (string | { id: string; name: string; slug?: string })[];
  authorId: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  category?: { id: string; name: string; slug?: string };
  coverImage?: string;
  featuredImage?: string;
  images?: { id: string; url: string; [key: string]: any }[];
  imageUrl?: string;
  rejectionReason?: string;
  revisionNotes?: string;
  autoPublish?: boolean;
  views?: number;
  seoTitle?: string;
  seoDescription?: string;
  relatedServicesIds?: string[];
  excerpt?: string;
}

interface UploadImageResponse {
  data: {
    id: string;
    url: string;
  };
}

export interface CreateBlogData {
  title: string;
  content: string;
  authorId: string;
  categoryId: string;
  tags?: string[];
  status?: 'draft' | 'pending_review' | 'approved' | 'published' | 'rejected' | 'archived';
  featuredImage?: string;
  views?: number;
  seoTitle?: string;
  seoDescription?: string;
  relatedServicesIds?: string[];
  excerpt?: string;
  autoPublish?: boolean;
}

export const BlogService = {
  async getAll(params: BlogQueryParams = {}) {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return apiClient.get<PaginationResponse<Blog>>(
      `${API_ENDPOINTS.BLOG.BASE}${query ? `?${query}` : ""}`
    );
  },
  async getById(id: string) {
    return apiClient.get<Blog>(`${API_ENDPOINTS.BLOG.BASE}/${id}`);
  },
  async create(data: CreateBlogData) {
    console.log("Creating blog with data:", JSON.stringify(data, null, 2));
    return apiClient.post<Blog>(API_ENDPOINTS.BLOG.BASE, data);
  },
  async update(id: string, data: UpdateBlogDto) {
    return apiClient.patch(`${API_ENDPOINTS.BLOG.BASE}/${id}`, data);
  },
  async submitReview(id: string) {
    return apiClient.patch(`${API_ENDPOINTS.BLOG.BASE}/${id}/submit-review`);
  },
  async review(id: string, data: ReviewBlogDto) {
    return apiClient.patch(`${API_ENDPOINTS.BLOG.BASE}/${id}/review`, data);
  },
  async publish(id: string, data: PublishBlogDto) {
    return apiClient.patch(`${API_ENDPOINTS.BLOG.BASE}/${id}/publish`, data);
  },
  async directPublish(id: string, data: PublishBlogDto) {
    return apiClient.patch(`${API_ENDPOINTS.BLOG.BASE}/${id}/direct-publish`, data);
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
  async getPendingReview(params: BlogQueryParams = {}) {
    const query = new URLSearchParams({
      ...params as Record<string, string>,
      status: "pending_review",
      limit: String(params.limit || 1000),
      page: String(params.page || 1),
    }).toString();
    return apiClient.get<PaginationResponse<Blog>>(
      `${API_ENDPOINTS.BLOG.BASE}${query ? `?${query}` : ""}`
    );
  },
  async getApproved(params: BlogQueryParams = {}) {
    const query = new URLSearchParams({
      ...params as Record<string, string>,
      status: "approved",
    }).toString();
    return apiClient.get<PaginationResponse<Blog>>(
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
