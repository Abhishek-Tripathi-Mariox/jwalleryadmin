import api from "../lib/axios";
import type { ApiResponse } from "../types";

export type Karat = "24K" | "22K" | "18K" | "SILVER";

export interface GoldRateMarkup {
  karat: Karat;
  flat: number;
  percent: number;
  liveRate: number | null;
  finalRate: number | null;
  updatedAt?: string | null;
}

export const KARAT_LABELS: Record<Karat, string> = {
  "24K": "24 Karat Gold",
  "22K": "22 Karat Gold",
  "18K": "18 Karat Gold",
  SILVER: "Silver",
};

export const goldRateMarkupService = {
  getAll: async (): Promise<ApiResponse<GoldRateMarkup[]>> => {
    const response = await api.get("/admin/gold-rate-markup");
    return response.data;
  },

  upsert: async (
    karat: Karat,
    flat: number,
    percent: number,
  ): Promise<ApiResponse<GoldRateMarkup>> => {
    const response = await api.put(`/admin/gold-rate-markup/${karat}`, {
      flat,
      percent,
    });
    return response.data;
  },
};
