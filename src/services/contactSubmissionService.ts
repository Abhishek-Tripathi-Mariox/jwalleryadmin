import api from "../lib/axios";
import type { ApiResponse } from "../types";

export type ContactSubmissionStatus =
  | "new"
  | "in_progress"
  | "resolved"
  | "spam";

export interface ContactSubmission {
  _id: string;
  fullName?: string;
  email: string;
  countryCode?: string;
  mobileNumber: string;
  interest?: string;
  message?: string;
  consent?: boolean;
  status: ContactSubmissionStatus;
  adminNotes?: string;
  ip?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactSubmissionList {
  page: number;
  limit: number;
  total: number;
  items: ContactSubmission[];
}

export const contactSubmissionService = {
  list: async (
    page = 1,
    limit = 20,
    status?: ContactSubmissionStatus,
  ): Promise<ApiResponse<ContactSubmissionList>> => {
    const qs = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (status) qs.set("status", status);
    const res = await api.get(`/admin/contact-submissions?${qs.toString()}`);
    return res.data;
  },

  update: async (
    id: string,
    patch: { status?: ContactSubmissionStatus; adminNotes?: string },
  ): Promise<ApiResponse<ContactSubmission>> => {
    const res = await api.patch(`/admin/contact-submissions/${id}`, patch);
    return res.data;
  },

  remove: async (id: string): Promise<ApiResponse<null>> => {
    const res = await api.delete(`/admin/contact-submissions/${id}`);
    return res.data;
  },
};
