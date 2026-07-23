import api from "../lib/axios";
import type { ApiResponse } from "../types";

export interface SmsConfig {
  _id: string;
  configType: "sms";
  provider: string;
  credentials: {
    authKey: string;
    templateId: string;
    senderId: string;
  };
  isActive: boolean;
  updatedAt: string;
  createdAt: string;
}

export interface EmailConfig {
  _id: string;
  configType: "email";
  provider: string;
  credentials: {
    host: string;
    port: string;
    username: string;
    password: string;
  };
  isActive: boolean;
  updatedAt: string;
  createdAt: string;
}

export interface SmsConfigForm {
  provider: string;
  authKey: string;
  templateId: string;
  senderId: string;
}

export interface EmailConfigForm {
  provider: string;
  host: string;
  port: string;
  username: string;
  password: string;
}

export interface PaymentConfig {
  _id: string;
  configType: "payment";
  provider: string;
  credentials: {
    keyId: string;
    keySecret: string;
    webhookSecret?: string;
  };
  isActive: boolean;
  updatedAt: string;
  createdAt: string;
}

export interface PaymentConfigForm {
  provider: string;
  keyId: string;
  keySecret: string;
  webhookSecret?: string;
}

export interface GoogleMapsConfig {
  _id: string;
  configType: "google_maps";
  provider: string;
  credentials: {
    apiKey: string;
  };
  isActive: boolean;
  updatedAt: string;
  createdAt: string;
}

export interface GoogleMapsConfigForm {
  provider: string;
  apiKey: string;
}

export interface FirebaseConfig {
  _id: string;
  configType: "firebase";
  provider: string;
  credentials: {
    apiKey: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  isActive: boolean;
  updatedAt: string;
  createdAt: string;
}

export interface FirebaseConfigForm {
  provider: string;
  apiKey: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface FirebaseAdminConfig {
  _id: string;
  configType: "firebase_admin";
  provider: string;
  credentials: {
    serviceAccountJson: string; // masked when returned from the API
  };
  isActive: boolean;
  updatedAt: string;
  createdAt: string;
}

export interface FirebaseAdminConfigForm {
  serviceAccountJson: string;
}

export interface ChatBotMessage {
  id: number;
  question: string;
  answer: string;
}

export interface SupportConfig {
  _id: string;
  configType: "support";
  provider: string;
  credentials: {
    phone: string;
    email: string;
    whatsapp: string;
    address?: string;
    workingHours: string;
    chatBotMessages: string; // JSON string
  };
  isActive: boolean;
  updatedAt: string;
  createdAt: string;
}

export interface SupportConfigForm {
  phone: string;
  email: string;
  whatsapp: string;
  address?: string;
  workingHours: string;
  chatBotMessages: ChatBotMessage[];
}

export const systemConfigService = {
  getSmsConfig: async (): Promise<ApiResponse<SmsConfig | null>> => {
    const response = await api.get("/admin/system-config/sms");
    return response.data;
  },

  saveSmsConfig: async (data: SmsConfigForm): Promise<ApiResponse<null>> => {
    const response = await api.post("/admin/system-config/sms", data);
    return response.data;
  },

  toggleSmsStatus: async (): Promise<ApiResponse<{ isActive: boolean }>> => {
    const response = await api.patch("/admin/system-config/sms/status");
    return response.data;
  },

  testSms: async (
    mobileNumber: string,
    countryCode: string = "91",
  ): Promise<ApiResponse<{ success: boolean; message: string }>> => {
    const response = await api.post("/admin/system-config/sms/test", {
      mobileNumber,
      countryCode,
    });
    return response.data;
  },

  getEmailConfig: async (): Promise<ApiResponse<EmailConfig | null>> => {
    const response = await api.get("/admin/system-config/email");
    return response.data;
  },

  saveEmailConfig: async (
    data: EmailConfigForm,
  ): Promise<ApiResponse<null>> => {
    const response = await api.post("/admin/system-config/email", data);
    return response.data;
  },

  toggleEmailStatus: async (): Promise<
    ApiResponse<{ isActive: boolean }>
  > => {
    const response = await api.patch("/admin/system-config/email/status");
    return response.data;
  },

  getPaymentConfig: async (): Promise<ApiResponse<PaymentConfig | null>> => {
    const response = await api.get("/admin/system-config/payment");
    return response.data;
  },

  savePaymentConfig: async (
    data: PaymentConfigForm,
  ): Promise<ApiResponse<null>> => {
    const response = await api.post("/admin/system-config/payment", data);
    return response.data;
  },

  togglePaymentStatus: async (): Promise<
    ApiResponse<{ isActive: boolean }>
  > => {
    const response = await api.patch("/admin/system-config/payment/status");
    return response.data;
  },

  // Google Maps
  getGoogleMapsConfig: async (): Promise<ApiResponse<GoogleMapsConfig | null>> => {
    const response = await api.get("/admin/system-config/google-maps");
    return response.data;
  },

  saveGoogleMapsConfig: async (data: GoogleMapsConfigForm): Promise<ApiResponse<null>> => {
    const response = await api.post("/admin/system-config/google-maps", data);
    return response.data;
  },

  toggleGoogleMapsStatus: async (): Promise<ApiResponse<{ isActive: boolean }>> => {
    const response = await api.patch("/admin/system-config/google-maps/status");
    return response.data;
  },

  // Raw (unmasked) key, for embedding the Maps JS SDK — e.g. the Store
  // location picker. Only ever called from admin-authenticated screens.
  getGoogleMapsKey: async (): Promise<ApiResponse<{ apiKey: string }>> => {
    const response = await api.get("/admin/system-config/google-maps/key");
    return response.data;
  },

  // Firebase
  getFirebaseConfig: async (): Promise<ApiResponse<FirebaseConfig | null>> => {
    const response = await api.get("/admin/system-config/firebase");
    return response.data;
  },

  saveFirebaseConfig: async (data: FirebaseConfigForm): Promise<ApiResponse<null>> => {
    const response = await api.post("/admin/system-config/firebase", data);
    return response.data;
  },

  toggleFirebaseStatus: async (): Promise<ApiResponse<{ isActive: boolean }>> => {
    const response = await api.patch("/admin/system-config/firebase/status");
    return response.data;
  },

  // Firebase Admin (server-side push credential — service account JSON)
  getFirebaseAdminConfig: async (): Promise<ApiResponse<FirebaseAdminConfig | null>> => {
    const response = await api.get("/admin/system-config/firebase-admin");
    return response.data;
  },

  saveFirebaseAdminConfig: async (data: FirebaseAdminConfigForm): Promise<ApiResponse<null>> => {
    const response = await api.post("/admin/system-config/firebase-admin", data);
    return response.data;
  },

  toggleFirebaseAdminStatus: async (): Promise<ApiResponse<{ isActive: boolean }>> => {
    const response = await api.patch("/admin/system-config/firebase-admin/status");
    return response.data;
  },

  // Support Config
  getSupportConfig: async (): Promise<ApiResponse<SupportConfig | null>> => {
    const response = await api.get("/admin/system-config/support");
    return response.data;
  },

  saveSupportConfig: async (data: SupportConfigForm): Promise<ApiResponse<null>> => {
    const response = await api.post("/admin/system-config/support", data);
    return response.data;
  },

  toggleSupportStatus: async (): Promise<ApiResponse<{ isActive: boolean }>> => {
    const response = await api.patch("/admin/system-config/support/status");
    return response.data;
  },
};
