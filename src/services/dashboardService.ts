import api from "../lib/axios";
import type { ApiResponse, Payment, DashboardStats } from "../types";

interface PaymentsResponse {
  page: number;
  limit: number;
  total: number;
  payments: Payment[];
}

export const paymentService = {
  getPayments: async (
    page = 1,
    limit = 10,
    status?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<ApiResponse<PaymentsResponse>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (status) params.append("status", status);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await api.get(`/admin/payments?${params.toString()}`);
    return response.data;
  },

  getPayment: async (id: string): Promise<ApiResponse<Payment>> => {
    const response = await api.get(`/admin/payments/${id}`);
    return response.data;
  },

  getPaymentStats: async (): Promise<
    ApiResponse<{
      totalAmount: number;
      totalTransactions: number;
      successfulPayments: number;
      pendingPayments: number;
      failedPayments: number;
    }>
  > => {
    const response = await api.get("/admin/payments/stats");
    return response.data;
  },

  refundPayment: async (
    paymentId: string,
    amount?: number,
  ): Promise<ApiResponse<Payment>> => {
    const response = await api.post(`/admin/payments/${paymentId}/refund`, {
      amount,
    });
    return response.data;
  },
};

export const dashboardService = {
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await api.get("/admin/dashboard/stats");
    return response.data;
  },

  getRecentOrders: async (): Promise<ApiResponse<{ orders: any[] }>> => {
    const response = await api.get("/admin/dashboard/recent-orders");
    return response.data;
  },

  getSalesChart: async (
    period: "week" | "month" | "year",
  ): Promise<
    ApiResponse<{
      labels: string[];
      data: number[];
    }>
  > => {
    const response = await api.get(
      `/admin/dashboard/sales-chart?period=${period}`,
    );
    return response.data;
  },

  getTopProducts: async (): Promise<ApiResponse<{ products: any[] }>> => {
    const response = await api.get("/admin/dashboard/top-products");
    return response.data;
  },
};
