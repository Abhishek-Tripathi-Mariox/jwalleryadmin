import api from "../lib/axios";
import type { ApiResponse } from "../types";

export interface CustomerReview {
  _id: string;
  name: string;
  rating: number;
  reviewText: string;
  avatar?: string;
  rank: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ReviewsResponse {
  page: number;
  limit: number;
  total: number;
  reviews: CustomerReview[];
}

export const customerReviewService = {
  getReviews: async (
    page = 1,
    limit = 10,
  ): Promise<ApiResponse<ReviewsResponse>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    const response = await api.get(`/admin/customer-reviews?${params.toString()}`);
    return response.data;
  },

  createReview: async (data: FormData): Promise<ApiResponse<CustomerReview>> => {
    const response = await api.post("/admin/customer-reviews", data, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120000,
    });
    return response.data;
  },

  updateReview: async (
    id: string,
    data: FormData,
  ): Promise<ApiResponse<CustomerReview>> => {
    const response = await api.put(`/admin/customer-reviews/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120000,
    });
    return response.data;
  },

  deleteReview: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/admin/customer-reviews/${id}`);
    return response.data;
  },

  toggleStatus: async (
    id: string,
  ): Promise<ApiResponse<{ isActive: boolean }>> => {
    const response = await api.patch(`/admin/customer-reviews/${id}/status`);
    return response.data;
  },
};
