import { apiClient } from "./api";

export interface Category {
  id: string;
  name: string;
  description?: string;
  type?: string;
  isActive?: boolean;
  parentId?: string;
  children?: Category[];
  parent?: Category | null;
}

export const CategoryService = {
  async getAllCategories() {
    return apiClient.get<Category[]>("/categories");
  },
  async createCategory(data: Partial<Category>) {
    return apiClient.post("/categories", data);
  },
  async getCategoryById(id: string) {
    return apiClient.get<Category>(`/categories/${id}`);
  },
  async updateCategory(id: string, data: Partial<Category>) {
    return apiClient.patch(`/categories/${id}`, data);
  },
  async deleteCategory(id: string) {
    return apiClient.delete(`/categories/${id}`);
  },
};
