import api from "../lib/axios";
import type { ApiResponse } from "../types";

export interface AdminNotification {
  _id: string;
  userId?: { _id: string; fullName?: string; email?: string; mobileNumber?: string } | null;
  type: "order" | "promo" | "system" | "broadcast";
  title: string;
  message: string;
  link?: string;
  orderId?: string | null;
  isRead: boolean;
  readBy?: string[];
  createdBy?: { _id: string; name?: string; email?: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminNotificationList {
  page: number;
  limit: number;
  total: number;
  items: AdminNotification[];
}

export interface SendNotificationPayload {
  userId?: string | null;
  title: string;
  message: string;
  link?: string;
  type?: "system" | "promo" | "broadcast";
}

export const notificationAdminService = {
  list: async (
    page = 1,
    limit = 20,
  ): Promise<ApiResponse<AdminNotificationList>> => {
    const response = await api.get(
      `/admin/notifications?page=${page}&limit=${limit}`,
    );
    return response.data;
  },

  send: async (
    payload: SendNotificationPayload,
  ): Promise<ApiResponse<AdminNotification>> => {
    const response = await api.post("/admin/notifications", payload);
    return response.data;
  },
};
