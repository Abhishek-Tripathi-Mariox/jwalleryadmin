import api from "../lib/axios";
import type { ApiResponse, Order, OrderStatus } from "../types";

interface OrdersResponse {
  page: number;
  limit: number;
  total: number;
  orders: Order[];
}

export const orderService = {
  getOrders: async (
    page = 1,
    limit = 10,
    status?: OrderStatus,
    paymentStatus?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<ApiResponse<OrdersResponse>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (status) params.append("status", status.toString());
    if (paymentStatus) params.append("paymentStatus", paymentStatus);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await api.get(`/admin/orders?${params.toString()}`);
    return response.data;
  },

  getOrder: async (id: string): Promise<ApiResponse<Order>> => {
    const response = await api.get(`/admin/orders/${id}`);
    return response.data;
  },

  updateOrderStatus: async (
    id: string,
    status: OrderStatus,
  ): Promise<ApiResponse<Order>> => {
    const response = await api.patch(`/admin/orders/${id}/status`, { status });
    return response.data;
  },

  // COD only — marks cash collected. Online payments update automatically
  // via Razorpay verification/webhook and should never use this.
  markPaymentReceived: async (id: string): Promise<ApiResponse<Order>> => {
    const response = await api.patch(`/admin/orders/${id}/payment-received`);
    return response.data;
  },

  getOrderStats: async (): Promise<
    ApiResponse<{
      total: number;
      pending: number;
      processing: number;
      shipped: number;
      delivered: number;
      cancelled: number;
    }>
  > => {
    const response = await api.get("/admin/orders/stats");
    return response.data;
  },
};

// Status enum mirrors the backend's UserOrders model:
//   1 = Order Received, 2 = Ready to Ship, 3 = On the Way,
//   4 = Delivered, 5 = Cancelled.
// Changing this without updating the model is a corruption bug — the previous
// 6-status map silently mis-set Delivered as Cancelled and vice versa.
export const ORDER_STATUS_MAP: Record<OrderStatus, string> = {
  1: "Order Received",
  2: "Ready to Ship",
  3: "On the Way",
  4: "Delivered",
  5: "Cancelled",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  1: "bg-blue-100 text-blue-800",
  2: "bg-yellow-100 text-yellow-800",
  3: "bg-purple-100 text-purple-800",
  4: "bg-green-100 text-green-800",
  5: "bg-red-100 text-red-800",
};

// Statuses that form the linear delivery flow (1 → 4). Cancelled (5) is a
// terminal off-track state and is shown separately.
export const ORDER_TRACK_FLOW: OrderStatus[] = [1, 2, 3, 4];
