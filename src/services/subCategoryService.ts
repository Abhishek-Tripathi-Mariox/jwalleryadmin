import api from "../lib/axios";
import type { ApiResponse } from "../types";

export interface SubCategory {
  _id: string;
  subCategoryName: string;
  categoryId: string | { _id: string; categoryName: string };
  image?: string;
  rank: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SubCategoriesResponse {
  page: number;
  limit: number;
  total: number;
  subCategories: SubCategory[];
}

export const subCategoryService = {
  getSubCategories: async (
    page = 1,
    limit = 50,
    categoryId?: string,
  ): Promise<ApiResponse<SubCategoriesResponse>> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (categoryId) params.set("categoryId", categoryId);
    const res = await api.get(`/admin/subcategories?${params.toString()}`);
    return res.data;
  },

  createSubCategory: async (data: FormData): Promise<ApiResponse<SubCategory>> => {
    const res = await api.post("/admin/subcategories", data, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120000,
    });
    return res.data;
  },

  updateSubCategory: async (
    id: string,
    data: FormData,
  ): Promise<ApiResponse<SubCategory>> => {
    const res = await api.put(`/admin/subcategories/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120000,
    });
    return res.data;
  },

  deleteSubCategory: async (id: string): Promise<ApiResponse<null>> => {
    const res = await api.delete(`/admin/subcategories/${id}`);
    return res.data;
  },

  toggleStatus: async (id: string): Promise<ApiResponse<{ isActive: boolean }>> => {
    const res = await api.patch(`/admin/subcategories/${id}/status`);
    return res.data;
  },
};
