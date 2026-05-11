import api from "../lib/axios";
import type { ApiResponse, LoginForm, Admin } from "../types";

interface LoginResponse {
  token: string;
  admin: Admin;
}

interface OtpResponse {
  txnId: string;
}

export const authService = {
  login: async (data: LoginForm): Promise<ApiResponse<LoginResponse>> => {
    const response = await api.post("/admin/auth/login", data);
    return response.data;
  },

  forgotPassword: async (email: string): Promise<ApiResponse<OtpResponse>> => {
    const response = await api.post("/admin/auth/forgot-password", { email });
    return response.data;
  },

  verifyOtp: async (
    txnId: string,
    otp: string,
  ): Promise<ApiResponse<{ verified: boolean }>> => {
    const response = await api.post("/admin/auth/verify-otp", { txnId, otp });
    return response.data;
  },

  resetPassword: async (
    txnId: string,
    password: string,
  ): Promise<ApiResponse<null>> => {
    const response = await api.post("/admin/auth/reset-password", {
      txnId,
      password,
    });
    return response.data;
  },

  changePassword: async (
    currentPassword: string,
    newPassword: string,
  ): Promise<ApiResponse<null>> => {
    const response = await api.put("/admin/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<Admin>> => {
    const response = await api.get("/admin/profile");
    return response.data;
  },

  updateProfile: async (data: { name?: string; email?: string }): Promise<ApiResponse<Admin>> => {
    const response = await api.put("/admin/profile", data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post("/admin/auth/logout");
  },
};
