import api from "../lib/axios";
import type { ApiResponse, Order, PaymentStatus } from "../types";

interface PaymentsResponse {
  page: number;
  limit: number;
  total: number;
  orders: Order[];
}

interface PaymentStatsData {
  paid: { amount: number; count: number };
  pending: { amount: number; count: number };
  refunded: { amount: number; count: number };
}

export const paymentService = {
  getPayments: async (
    page = 1,
    limit = 10,
    paymentStatus?: PaymentStatus,
    startDate?: string,
    endDate?: string,
  ): Promise<ApiResponse<PaymentsResponse>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (paymentStatus) params.append("paymentStatus", paymentStatus);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    const response = await api.get(`/admin/payments?${params.toString()}`);
    return response.data;
  },

  getPaymentStats: async (): Promise<ApiResponse<PaymentStatsData>> => {
    const response = await api.get("/admin/payments/stats");
    return response.data;
  },
};
