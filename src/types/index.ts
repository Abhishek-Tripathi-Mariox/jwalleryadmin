// User Types
export interface User {
  _id: string;
  fullName: string;
  email: string;
  profileImages: string;
  gender: "Male" | "Female" | "Other";
  dob: string;
  countryCode: string;
  mobileNumber: string;
  isActive: boolean;
  isDeleted: boolean;
  notificationAllowed: boolean;
  createdAt: string;
  updatedAt: string;
}

// Admin Types
export interface AdminPermission {
  module: string;
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

export interface Admin {
  _id: string;
  email: string;
  name: string;
  phone?: string;
  role: "admin" | "superadmin";
  roleId?: {
    _id: string;
    name: string;
    permissions: AdminPermission[];
  } | null;
  permissions?: AdminPermission[];
  isActive: boolean;
  createdAt: string;
}

// Category Types
export interface Category {
  _id: string;
  categoryName: string;
  image: string;
  showOnHomeScreen: boolean;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// Product Types
export interface ProductColor {
  name: string;
  code: string;
}

export interface ProductSize {
  label: string;
  inStock: boolean;
}

export interface ProductImage {
  url: string;
}

export interface RotationImage {
  url: string;
  order: number;
}

export interface Product {
  _id: string;
  productName: string;
  brand: string;
  shopId: string;
  categoryId: string;
  productImages: ProductImage[];
  rotationImages: RotationImage[];
  model3dUrl?: string;
  arModelUrl?: string;
  colors: ProductColor[];
  sizes: ProductSize[];
  price: number;
  discountPrice: number;
  discountPercent: number;
  currency: string;
  stock: number;
  rating: number;
  totalRatings: number;
  description: string;
  features: string;
  highlights: { text: string }[];
  isFeatured: boolean;
  showOnDashboard: boolean;
  isDeleted: boolean;
  isActive: boolean;
  slug: string;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  material?: string;
  subCategoryId?: string;
  goldPricing?: {
    isEnabled: boolean;
    weightGrams: number;
    goldPurityPercent: number;
    makingChargePercent: number;
  };
}

// Order Types
export type OrderStatus = 1 | 2 | 3 | 4 | 5;
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type PaymentMode = "cod" | "online";

export interface OrderProduct {
  productId: string;
  productName: string;
  productImage: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount: number;
}

export interface OrderAddress {
  _id: string;
  fullName: string;
  mobileNumber: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
  addressType: string;
}

export interface Order {
  _id: string;
  orderId: string;
  userId: string;
  user?: User;
  addressId: string;
  address?: OrderAddress;
  products: OrderProduct[];
  subtotal: number;
  shippingCost: number;
  platformFee?: number;
  couponDiscount: number;
  grandTotal: number;
  paymentMode: PaymentMode;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
  updatedAt: string;
}

// Payment Types
export interface Payment {
  _id: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMode: PaymentMode;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  page: number;
  limit: number;
  total: number;
  data: T[];
}

// Dashboard Types
export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
  pendingOrders: number;
  monthlyRevenue: number;
}

export interface ChartData {
  label: string;
  value: number;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface ForgotPasswordForm {
  email: string;
}

export interface VerifyOtpForm {
  otp: string;
  txnId: string;
}

export interface ResetPasswordForm {
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProductForm {
  productName: string;
  brand: string;
  categoryId: string;
  price: number;
  discountPrice: number;
  discountPercent: number;
  stock: number;
  description: string;
  features: string;
  isFeatured: boolean;
  showOnDashboard: boolean;
  isActive: boolean;
}

export interface CategoryForm {
  categoryName: string;
  image?: File;
  isActive: boolean;
}
