import api from "../lib/axios";
import type { ApiResponse } from "../types";

export interface Reel {
  _id: string;
  title?: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  thumbnailUrl?: string;
  instagramUrl: string;
  rank: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ReelsResponse {
  page: number;
  limit: number;
  total: number;
  reels: Reel[];
}

export const reelService = {
  getReels: async (
    page = 1,
    limit = 10,
  ): Promise<ApiResponse<ReelsResponse>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    const response = await api.get(`/admin/reels?${params.toString()}`);
    return response.data;
  },

  createReel: async (data: FormData): Promise<ApiResponse<Reel>> => {
    const response = await api.post("/admin/reels", data, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120000,
    });
    return response.data;
  },

  updateReel: async (
    id: string,
    data: FormData,
  ): Promise<ApiResponse<Reel>> => {
    const response = await api.put(`/admin/reels/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120000,
    });
    return response.data;
  },

  deleteReel: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/admin/reels/${id}`);
    return response.data;
  },

  toggleStatus: async (
    id: string,
  ): Promise<ApiResponse<{ isActive: boolean }>> => {
    const response = await api.patch(`/admin/reels/${id}/status`);
    return response.data;
  },
};
