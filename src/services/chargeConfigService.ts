import api from "../lib/axios";
import type { ApiResponse } from "../types";

export interface ChargeConfig {
  _id?: string;
  shippingActive: boolean;
  shippingFlat: number;
  freeShippingThreshold: number;
  platformFeeActive: boolean;
  platformFeeFlat: number;
  platformFeePercent: number;
  prepaidDiscountActive?: boolean;
  prepaidDiscountPercent?: number;
  updatedAt?: string;
}

export const chargeConfigService = {
  get: async (): Promise<ApiResponse<ChargeConfig>> => {
    const res = await api.get("/admin/charges");
    return res.data;
  },

  update: async (
    patch: Partial<ChargeConfig>,
  ): Promise<ApiResponse<ChargeConfig>> => {
    const res = await api.put("/admin/charges", patch);
    return res.data;
  },
};
