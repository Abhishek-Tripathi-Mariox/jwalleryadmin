import api from "../lib/axios";
import type { ApiResponse, Product } from "../types";

interface ProductsResponse {
  page: number;
  limit: number;
  total: number;
  products: Product[];
}

export const productService = {
  getProducts: async (
    page = 1,
    limit = 10,
    search = "",
    categoryId = "",
    status = "",
  ): Promise<ApiResponse<ProductsResponse>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) params.append("search", search);
    if (categoryId) params.append("categoryId", categoryId);
    if (status) params.append("status", status);

    const response = await api.get(`/admin/products?${params.toString()}`);
    return response.data;
  },

  getProduct: async (id: string): Promise<ApiResponse<Product>> => {
    const response = await api.get(`/admin/products/${id}`);
    return response.data;
  },

  createProduct: async (data: FormData): Promise<ApiResponse<Product>> => {
    const response = await api.post("/admin/products", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  updateProduct: async (
    id: string,
    data: FormData,
  ): Promise<ApiResponse<Product>> => {
    const response = await api.put(`/admin/products/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  deleteProduct: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/admin/products/${id}`);
    return response.data;
  },

  toggleStatus: async (
    id: string,
    isActive: boolean,
  ): Promise<ApiResponse<Product>> => {
    const response = await api.patch(`/admin/products/${id}/status`, {
      isActive,
    });
    return response.data;
  },

  toggleFeatured: async (
    id: string,
    isFeatured: boolean,
  ): Promise<ApiResponse<Product>> => {
    const response = await api.patch(`/admin/products/${id}/featured`, {
      isFeatured,
    });
    return response.data;
  },
};
