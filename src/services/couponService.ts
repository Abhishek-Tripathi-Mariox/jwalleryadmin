import api from "../lib/axios";
import type { ApiResponse } from "../types";

export interface Coupon {
  _id: string;
  code: string;
  title: string;
  description: string;
  image: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maxDiscountAmount: number;
  minOrderValue: number;
  startDate: string;
  endDate: string;
  applicableFor: "all" | "newUser" | "specificUser";
  specificUserMobile: string;
  paymentMode: "online" | "cod" | "both";
  maxUsagePerUser?: number;
  maxTotalUsage?: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CouponsResponse {
  page: number;
  limit: number;
  total: number;
  coupons: Coupon[];
}

export const couponService = {
  getCoupons: async (
    page = 1,
    limit = 10,
    search = "",
  ): Promise<ApiResponse<CouponsResponse>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) params.append("search", search);
    const response = await api.get(`/admin/coupons?${params.toString()}`);
    return response.data;
  },

  getCoupon: async (id: string): Promise<ApiResponse<Coupon>> => {
    const response = await api.get(`/admin/coupons/${id}`);
    return response.data;
  },

  createCoupon: async (data: Record<string, unknown>): Promise<ApiResponse<Coupon>> => {
    const response = await api.post("/admin/coupons", data);
    return response.data;
  },

  updateCoupon: async (
    id: string,
    data: Record<string, unknown>,
  ): Promise<ApiResponse<Coupon>> => {
    const response = await api.put(`/admin/coupons/${id}`, data);
    return response.data;
  },

  deleteCoupon: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/admin/coupons/${id}`);
    return response.data;
  },

  toggleStatus: async (id: string): Promise<ApiResponse<{ isActive: boolean }>> => {
    const response = await api.patch(`/admin/coupons/${id}/status`);
    return response.data;
  },
};
