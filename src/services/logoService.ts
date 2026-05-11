import api from "../lib/axios";
import type { ApiResponse } from "../types";

export interface Logo {
  _id: string;
  type: "primary" | "secondary" | "favicon" | "mobile_splash" | "email_header";
  title: string;
  imageUrl: string;
  isActive: boolean;
  uploadedBy?: { _id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export const LOGO_TYPES = [
  { key: "primary", label: "Primary Logo", desc: "Main logo for website header & admin panel" },
  { key: "secondary", label: "Secondary Logo", desc: "Light version for dark backgrounds" },
  { key: "favicon", label: "Favicon", desc: "Browser tab icon (32x32 or 64x64)" },
  { key: "mobile_splash", label: "Mobile Splash", desc: "Splash screen logo for mobile app" },
  { key: "email_header", label: "Email Header", desc: "Logo for transactional emails" },
];

export const logoService = {
  getAll: async (): Promise<ApiResponse<Logo[]>> => {
    const response = await api.get("/admin/logos");
    return response.data;
  },

  upload: async (type: string, file: File, title?: string): Promise<ApiResponse<Logo>> => {
    const formData = new FormData();
    formData.append("type", type);
    formData.append("image", file);
    if (title) formData.append("title", title);

    const response = await api.post("/admin/logos", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/admin/logos/${id}`);
    return response.data;
  },
};
