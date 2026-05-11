import api from "../lib/axios";
import type { ApiResponse, Category } from "../types";

interface CategoriesResponse {
  page: number;
  limit: number;
  total: number;
  categories: Category[];
}

export const categoryService = {
  getCategories: async (
    page = 1,
    limit = 10,
    search = "",
  ): Promise<ApiResponse<CategoriesResponse>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) params.append("search", search);

    const response = await api.get(`/admin/categories?${params.toString()}`);
    return response.data;
  },

  getAllCategories: async (): Promise<
    ApiResponse<{ categories: Category[] }>
  > => {
    const response = await api.get("/admin/categories?limit=100");
    return response.data;
  },

  getCategory: async (id: string): Promise<ApiResponse<Category>> => {
    const response = await api.get(`/admin/categories/${id}`);
    return response.data;
  },

  createCategory: async (data: FormData): Promise<ApiResponse<Category>> => {
    const response = await api.post("/admin/categories", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  updateCategory: async (
    id: string,
    data: FormData,
  ): Promise<ApiResponse<Category>> => {
    const response = await api.put(`/admin/categories/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  deleteCategory: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/admin/categories/${id}`);
    return response.data;
  },

  toggleStatus: async (
    id: string,
    isActive: boolean,
  ): Promise<ApiResponse<Category>> => {
    const response = await api.patch(`/admin/categories/${id}/status`, {
      isActive,
    });
    return response.data;
  },
};
