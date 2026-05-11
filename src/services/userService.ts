import api from "../lib/axios";
import type { ApiResponse, User } from "../types";

interface UsersResponse {
  page: number;
  limit: number;
  total: number;
  users: User[];
}

export const userService = {
  getUsers: async (
    page = 1,
    limit = 10,
    search = "",
    status = "",
  ): Promise<ApiResponse<UsersResponse>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) params.append("search", search);
    if (status) params.append("status", status);

    const response = await api.get(`/admin/users?${params.toString()}`);
    return response.data;
  },

  getUser: async (id: string): Promise<ApiResponse<User>> => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  toggleStatus: async (
    id: string,
    isActive: boolean,
  ): Promise<ApiResponse<User>> => {
    const response = await api.patch(`/admin/users/${id}/status`, {
      isActive,
    });
    return response.data;
  },

  deleteUser: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  getUserOrders: async (
    userId: string,
  ): Promise<ApiResponse<{ orders: any[] }>> => {
    const response = await api.get(`/admin/users/${userId}/orders`);
    return response.data;
  },
};
