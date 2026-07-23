import api from "../lib/axios";
import type { ApiResponse } from "../types";

export interface Store {
  _id: string;
  name: string;
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  whatsapp?: string;
  workingHours?: string;
  latitude?: number;
  longitude?: number;
  rank: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoreForm {
  name: string;
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  whatsapp?: string;
  workingHours?: string;
  latitude?: string;
  longitude?: string;
  rank?: string;
}

interface StoresResponse {
  page: number;
  limit: number;
  total: number;
  stores: Store[];
}

export const storeService = {
  getStores: async (page = 1, limit = 100): Promise<ApiResponse<StoresResponse>> => {
    const res = await api.get(`/admin/stores?page=${page}&limit=${limit}`);
    return res.data;
  },

  createStore: async (data: StoreForm): Promise<ApiResponse<Store>> => {
    const res = await api.post("/admin/stores", data);
    return res.data;
  },

  updateStore: async (id: string, data: StoreForm): Promise<ApiResponse<Store>> => {
    const res = await api.put(`/admin/stores/${id}`, data);
    return res.data;
  },

  deleteStore: async (id: string): Promise<ApiResponse<null>> => {
    const res = await api.delete(`/admin/stores/${id}`);
    return res.data;
  },

  toggleStatus: async (id: string): Promise<ApiResponse<{ isActive: boolean }>> => {
    const res = await api.patch(`/admin/stores/${id}/status`);
    return res.data;
  },
};
