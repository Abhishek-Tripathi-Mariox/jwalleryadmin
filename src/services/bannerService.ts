import api from "../lib/axios";
import type { ApiResponse } from "../types";

export interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  section?: string;
  link?: string;
  mobileView: string;
  ipadView: string;
  desktopView: string;
  rank: number;
  startDate: string;
  expireDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BannersResponse {
  page: number;
  limit: number;
  total: number;
  banners: Banner[];
}

export const bannerService = {
  getBanners: async (
    page = 1,
    limit = 10,
  ): Promise<ApiResponse<BannersResponse>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    const response = await api.get(`/admin/banners?${params.toString()}`);
    return response.data;
  },

  getBanner: async (id: string): Promise<ApiResponse<Banner>> => {
    const response = await api.get(`/admin/banners/${id}`);
    return response.data;
  },

  createBanner: async (data: FormData): Promise<ApiResponse<Banner>> => {
    const response = await api.post("/admin/banners", data, {
      headers: { "Content-Type": undefined },
      timeout: 120000,
    });
    return response.data;
  },

  updateBanner: async (
    id: string,
    data: FormData,
  ): Promise<ApiResponse<Banner>> => {
    const response = await api.put(`/admin/banners/${id}`, data, {
      headers: { "Content-Type": undefined },
      timeout: 120000,
    });
    return response.data;
  },

  deleteBanner: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/admin/banners/${id}`);
    return response.data;
  },

  toggleStatus: async (id: string): Promise<ApiResponse<{ isActive: boolean }>> => {
    const response = await api.patch(`/admin/banners/${id}/status`);
    return response.data;
  },
};
