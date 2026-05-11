import api from "../lib/axios";
import type { ApiResponse } from "../types";
import type { Role } from "./roleService";

export interface Staff {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "superadmin";
  roleId: Role | null;
  isActive: boolean;
  isDeleted: boolean;
  lastLogin: string | null;
  createdBy?: { _id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface StaffForm {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: "admin" | "superadmin";
  roleId?: string;
}

export const staffService = {
  getAll: async (): Promise<ApiResponse<Staff[]>> => {
    const response = await api.get("/admin/staff");
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Staff>> => {
    const response = await api.get(`/admin/staff/${id}`);
    return response.data;
  },

  create: async (data: StaffForm): Promise<ApiResponse<Staff>> => {
    const response = await api.post("/admin/staff", data);
    return response.data;
  },

  update: async (id: string, data: Partial<StaffForm>): Promise<ApiResponse<Staff>> => {
    const response = await api.put(`/admin/staff/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/admin/staff/${id}`);
    return response.data;
  },

  toggleStatus: async (id: string): Promise<ApiResponse<{ isActive: boolean }>> => {
    const response = await api.patch(`/admin/staff/${id}/status`);
    return response.data;
  },
};
