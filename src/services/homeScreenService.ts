import api from "../lib/axios";
import type { ApiResponse, Product, Category } from "../types";

// Types for Home Screen Management
export interface GoldPrice {
  _id: string;
  purity: "22K" | "24K" | "Silver";
  rate: number;
  unit: string;
  isActive: boolean;
  updatedAt: string;
}

export interface SpecialOffer {
  _id: string;
  title: string;
  description: string;
  mediaType: "image" | "gif" | "video";
  mediaUrl: string;
  linkType: "product" | "category" | "external";
  linkId?: string;
  externalUrl?: string;
  rank: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface FeaturedCollection {
  _id: string;
  title: string;
  subtitle?: string;
  image: string;
  linkType: "category" | "products" | "custom";
  linkId?: string;
  rank: number;
  size: "large" | "small";
  isActive: boolean;
  createdAt: string;
}

export interface HomeScreenConfig {
  featuredCategories: string[];
  featuredProducts: string[];
  bestSellers: string[];
  newArrivals: string[];
  goldPrices: GoldPrice[];
  specialOffers: SpecialOffer[];
  featuredCollections: FeaturedCollection[];
}

interface ProductsResponse {
  products: Product[];
  total: number;
}

interface CategoriesResponse {
  categories: Category[];
  total: number;
}

export const homeScreenService = {
  // Get home screen configuration
  getConfig: async (): Promise<ApiResponse<HomeScreenConfig>> => {
    const response = await api.get("/admin/home-screen/config");
    return response.data;
  },

  // Update home screen configuration
  updateConfig: async (config: Partial<HomeScreenConfig>): Promise<ApiResponse<HomeScreenConfig>> => {
    const response = await api.put("/admin/home-screen/config", config);
    return response.data;
  },

  // Gold Prices
  getGoldPrices: async (): Promise<ApiResponse<{ prices: GoldPrice[] }>> => {
    const response = await api.get("/admin/home-screen/gold-prices");
    return response.data;
  },

  updateGoldPrice: async (
    purity: string,
    rate: number
  ): Promise<ApiResponse<GoldPrice>> => {
    const response = await api.put("/admin/home-screen/gold-prices", { purity, rate });
    return response.data;
  },

  // Featured Products
  getFeaturedProducts: async (): Promise<ApiResponse<ProductsResponse>> => {
    const response = await api.get("/admin/products?isFeatured=true&limit=50");
    return response.data;
  },

  setFeaturedProducts: async (productIds: string[]): Promise<ApiResponse<null>> => {
    const response = await api.put("/admin/home-screen/featured-products", { productIds });
    return response.data;
  },

  // Best Sellers
  getBestSellers: async (): Promise<ApiResponse<ProductsResponse>> => {
    const response = await api.get("/admin/products?isBestSeller=true&limit=50");
    return response.data;
  },

  setBestSellers: async (productIds: string[]): Promise<ApiResponse<null>> => {
    const response = await api.put("/admin/home-screen/best-sellers", { productIds });
    return response.data;
  },

  // New Arrivals
  getNewArrivals: async (): Promise<ApiResponse<ProductsResponse>> => {
    const response = await api.get("/admin/products?isNewArrival=true&limit=50");
    return response.data;
  },

  setNewArrivals: async (productIds: string[]): Promise<ApiResponse<null>> => {
    const response = await api.put("/admin/home-screen/new-arrivals", { productIds });
    return response.data;
  },

  // Featured Categories
  getFeaturedCategories: async (): Promise<ApiResponse<CategoriesResponse>> => {
    const response = await api.get("/admin/categories?showOnHomeScreen=true");
    return response.data;
  },

  setFeaturedCategories: async (categoryIds: string[]): Promise<ApiResponse<null>> => {
    const response = await api.put("/admin/home-screen/featured-categories", { categoryIds });
    return response.data;
  },

  // Special Offers
  getSpecialOffers: async (): Promise<ApiResponse<{ offers: SpecialOffer[] }>> => {
    const response = await api.get("/admin/home-screen/special-offers");
    return response.data;
  },

  createSpecialOffer: async (data: FormData): Promise<ApiResponse<SpecialOffer>> => {
    const response = await api.post("/admin/home-screen/special-offers", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  updateSpecialOffer: async (id: string, data: FormData): Promise<ApiResponse<SpecialOffer>> => {
    const response = await api.put(`/admin/home-screen/special-offers/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  deleteSpecialOffer: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/admin/home-screen/special-offers/${id}`);
    return response.data;
  },

  toggleSpecialOfferStatus: async (id: string): Promise<ApiResponse<SpecialOffer>> => {
    const response = await api.patch(`/admin/home-screen/special-offers/${id}/status`);
    return response.data;
  },

  // Featured Collections
  getFeaturedCollections: async (): Promise<ApiResponse<{ collections: FeaturedCollection[] }>> => {
    const response = await api.get("/admin/home-screen/collections");
    return response.data;
  },

  createFeaturedCollection: async (data: FormData): Promise<ApiResponse<FeaturedCollection>> => {
    const response = await api.post("/admin/home-screen/collections", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  updateFeaturedCollection: async (id: string, data: FormData): Promise<ApiResponse<FeaturedCollection>> => {
    const response = await api.put(`/admin/home-screen/collections/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  deleteFeaturedCollection: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/admin/home-screen/collections/${id}`);
    return response.data;
  },

  toggleCollectionStatus: async (id: string): Promise<ApiResponse<FeaturedCollection>> => {
    const response = await api.patch(`/admin/home-screen/collections/${id}/status`);
    return response.data;
  },

  // Get all products for selection
  getAllProducts: async (search = ""): Promise<ApiResponse<ProductsResponse>> => {
    const params = new URLSearchParams({ limit: "100" });
    if (search) params.append("search", search);
    const response = await api.get(`/admin/products?${params.toString()}`);
    return response.data;
  },

  // Get all categories for selection
  getAllCategories: async (): Promise<ApiResponse<CategoriesResponse>> => {
    const response = await api.get("/admin/categories?limit=100");
    return response.data;
  },
};
