import api from "../lib/axios";
import type { ApiResponse } from "../types";

export interface Permission {
  module: string;
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

export interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
  isActive: boolean;
  isDeleted: boolean;
  createdBy?: { _id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface RoleForm {
  name: string;
  description: string;
  permissions: Permission[];
}

export const MODULES = [
  { key: "dashboard", label: "Dashboard", group: "General" },
  { key: "orders", label: "Orders", group: "Operations" },
  { key: "payments", label: "Payments", group: "Operations" },
  { key: "users", label: "Users", group: "Operations" },
  { key: "banners", label: "Banners", group: "Marketing" },
  { key: "coupons", label: "Coupons", group: "Marketing" },
  { key: "home-screen", label: "Home Screen", group: "Website Management" },
  { key: "categories", label: "Categories", group: "Website Management" },
  { key: "products", label: "Products", group: "Website Management" },
  { key: "system-sms", label: "SMS Config", group: "System Management" },
  { key: "system-email", label: "Email Config", group: "System Management" },
  { key: "system-payment", label: "Payment Config", group: "System Management" },
  { key: "system-google-maps", label: "Google Maps", group: "System Management" },
  { key: "system-firebase", label: "Firebase", group: "System Management" },
  { key: "system-support", label: "Support Config", group: "System Management" },
  { key: "settings", label: "Settings", group: "System Management" },
  { key: "logos", label: "Logo Management", group: "Team & Assets" },
  { key: "roles", label: "Roles", group: "Team & Assets" },
  { key: "staff", label: "Staff", group: "Team & Assets" },
];

export const roleService = {
  getAll: async (): Promise<ApiResponse<Role[]>> => {
    const response = await api.get("/admin/roles");
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Role>> => {
    const response = await api.get(`/admin/roles/${id}`);
    return response.data;
  },

  create: async (data: RoleForm): Promise<ApiResponse<Role>> => {
    const response = await api.post("/admin/roles", data);
    return response.data;
  },

  update: async (id: string, data: RoleForm): Promise<ApiResponse<Role>> => {
    const response = await api.put(`/admin/roles/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/admin/roles/${id}`);
    return response.data;
  },

  toggleStatus: async (id: string): Promise<ApiResponse<{ isActive: boolean }>> => {
    const response = await api.patch(`/admin/roles/${id}/status`);
    return response.data;
  },
};
