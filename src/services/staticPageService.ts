import api from "../lib/axios";
import type { ApiResponse } from "../types";

export interface StaticPage {
  _id?: string;
  slug: string;
  title: string;
  subtitle?: string;
  content?: string;
  seoDescription?: string;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const staticPageService = {
  list: async (): Promise<ApiResponse<StaticPage[]>> => {
    const res = await api.get("/admin/pages");
    return res.data;
  },
  get: async (slug: string): Promise<ApiResponse<StaticPage | null>> => {
    const res = await api.get(`/admin/pages/${encodeURIComponent(slug)}`);
    return res.data;
  },
  save: async (page: StaticPage): Promise<ApiResponse<StaticPage>> => {
    const res = await api.put("/admin/pages", page);
    return res.data;
  },
  remove: async (id: string): Promise<ApiResponse<null>> => {
    const res = await api.delete(`/admin/pages/${id}`);
    return res.data;
  },
};
