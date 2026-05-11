import React, { useState, useEffect } from "react";
import {
  Star,
  Sparkles,
  Image as ImageIcon,
  Grid,
  DollarSign,
  Save,
  Plus,
  Trash2,
  Edit,
  Power,
  Search,
  Check,
  Film,
  FileImage,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Modal } from "../../components/ui/Modal";
import { Badge } from "../../components/ui/Badge";
import { Table } from "../../components/ui/Table";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { useToast } from "../../store/toastStore";
import {
  homeScreenService,
  type GoldPrice,
  type SpecialOffer,
  type FeaturedCollection,
} from "../../services/homeScreenService";
import { PLACEHOLDER_IMAGE, formatCurrency } from "../../lib/utils";
import type { Product, Category } from "../../types";

type TabType = "prices" | "featured" | "offers" | "collections" | "categories" | "bestsellers" | "arrivals";

export function HomeScreenPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("prices");
  const [loading, setLoading] = useState(true);

  // Data states
  const [specialOffers, setSpecialOffers] = useState<SpecialOffer[]>([]);
  const [collections, setCollections] = useState<FeaturedCollection[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  
  // Selection states
  const [featuredProducts, setFeaturedProducts] = useState<string[]>([]);
  const [bestSellers, setBestSellers] = useState<string[]>([]);
  const [newArrivals, setNewArrivals] = useState<string[]>([]);
  const [featuredCategories, setFeaturedCategories] = useState<string[]>([]);

  // Form states for prices
  const [price22K, setPrice22K] = useState("");
  const [price24K, setPrice24K] = useState("");
  const [silverPrice, setSilverPrice] = useState("");

  // Modal states
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);
  const [editOffer, setEditOffer] = useState<SpecialOffer | null>(null);
  const [editCollection, setEditCollection] = useState<FeaturedCollection | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "offer" | "collection"; id: string } | null>(null);

  // Offer form
  const [offerTitle, setOfferTitle] = useState("");
  const [offerDescription, setOfferDescription] = useState("");
  const [offerMediaType, setOfferMediaType] = useState<"image" | "gif" | "video">("image");
  const [offerFile, setOfferFile] = useState<File | null>(null);
  const [offerLinkType, setOfferLinkType] = useState<"product" | "category" | "external">("product");
  const [offerLinkId, setOfferLinkId] = useState("");
  const [offerExternalUrl, setOfferExternalUrl] = useState("");
  const [offerRank, setOfferRank] = useState("0");
  const [offerStartDate, setOfferStartDate] = useState("");
  const [offerEndDate, setOfferEndDate] = useState("");

  // Collection form
  const [collectionTitle, setCollectionTitle] = useState("");
  const [collectionSubtitle, setCollectionSubtitle] = useState("");
  const [collectionFile, setCollectionFile] = useState<File | null>(null);
  const [collectionLinkType, setCollectionLinkType] = useState<"category" | "products" | "custom">("category");
  const [collectionLinkId, setCollectionLinkId] = useState("");
  const [collectionRank, setCollectionRank] = useState("0");
  const [collectionSize, setCollectionSize] = useState<"large" | "small">("small");

  const [saving, setSaving] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  const tabs = [
    { id: "prices" as TabType, label: "Gold Prices", icon: DollarSign },
    { id: "featured" as TabType, label: "Featured Products", icon: Star },
    { id: "bestsellers" as TabType, label: "Best Sellers", icon: Sparkles },
    { id: "arrivals" as TabType, label: "New Arrivals", icon: Sparkles },
    { id: "categories" as TabType, label: "Featured Categories", icon: Grid },
    { id: "offers" as TabType, label: "Special Offers", icon: ImageIcon },
    { id: "collections" as TabType, label: "Collections", icon: Grid },
  ];

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pricesRes, offersRes, collectionsRes, productsRes, categoriesRes] = await Promise.all([
        homeScreenService.getGoldPrices().catch(() => ({ code: 0, data: { prices: [] } })),
        homeScreenService.getSpecialOffers().catch(() => ({ code: 0, data: { offers: [] } })),
        homeScreenService.getFeaturedCollections().catch(() => ({ code: 0, data: { collections: [] } })),
        homeScreenService.getAllProducts().catch(() => ({ code: 0, data: { products: [] } })),
        homeScreenService.getAllCategories().catch(() => ({ code: 0, data: { categories: [] } })),
      ]);

      if (pricesRes.code === 1 && pricesRes.data?.prices) {
        const p22 = pricesRes.data.prices.find((p: GoldPrice) => p.purity === "22K");
        const p24 = pricesRes.data.prices.find((p: GoldPrice) => p.purity === "24K");
        const pSilver = pricesRes.data.prices.find((p: GoldPrice) => p.purity === "Silver");
        if (p22) setPrice22K(String(p22.rate));
        if (p24) setPrice24K(String(p24.rate));
        if (pSilver) setSilverPrice(String(pSilver.rate));
      }

      if (offersRes.code === 1 && offersRes.data?.offers) {
        setSpecialOffers(offersRes.data.offers);
      }

      if (collectionsRes.code === 1 && collectionsRes.data?.collections) {
        setCollections(collectionsRes.data.collections);
      }

      if (productsRes.code === 1 && productsRes.data?.products) {
        const products = productsRes.data.products;
        setAllProducts(products);
        setFeaturedProducts(products.filter((p: Product) => p.isFeatured).map((p: Product) => p._id));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setBestSellers(products.filter((p: any) => p.isBestSeller).map((p: Product) => p._id));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setNewArrivals(products.filter((p: any) => p.isNewArrival).map((p: Product) => p._id));
      }

      if (categoriesRes.code === 1 && categoriesRes.data?.categories) {
        setAllCategories(categoriesRes.data.categories);
        setFeaturedCategories(categoriesRes.data.categories.filter((c: Category) => c.showOnHomeScreen).map((c: Category) => c._id));
      }
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Save Gold Prices
  const handleSavePrices = async () => {
    setSaving(true);
    try {
      await Promise.all([
        homeScreenService.updateGoldPrice("22K", parseFloat(price22K) || 0),
        homeScreenService.updateGoldPrice("24K", parseFloat(price24K) || 0),
        homeScreenService.updateGoldPrice("Silver", parseFloat(silverPrice) || 0),
      ]);
      toast.success("Gold prices updated successfully");
    } catch {
      toast.error("Failed to update prices");
    } finally {
      setSaving(false);
    }
  };

  // Save Featured Products
  const handleSaveFeaturedProducts = async () => {
    setSaving(true);
    try {
      await homeScreenService.setFeaturedProducts(featuredProducts);
      toast.success("Featured products updated");
    } catch {
      toast.error("Failed to update featured products");
    } finally {
      setSaving(false);
    }
  };

  // Save Best Sellers
  const handleSaveBestSellers = async () => {
    setSaving(true);
    try {
      await homeScreenService.setBestSellers(bestSellers);
      toast.success("Best sellers updated");
    } catch {
      toast.error("Failed to update best sellers");
    } finally {
      setSaving(false);
    }
  };

  // Save New Arrivals
  const handleSaveNewArrivals = async () => {
    setSaving(true);
    try {
      await homeScreenService.setNewArrivals(newArrivals);
      toast.success("New arrivals updated");
    } catch {
      toast.error("Failed to update new arrivals");
    } finally {
      setSaving(false);
    }
  };

  // Save Featured Categories
  const handleSaveFeaturedCategories = async () => {
    setSaving(true);
    try {
      await homeScreenService.setFeaturedCategories(featuredCategories);
      toast.success("Featured categories updated");
    } catch {
      toast.error("Failed to update featured categories");
    } finally {
      setSaving(false);
    }
  };

  // Toggle product selection
  const toggleProductSelection = (productId: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (list.includes(productId)) {
      setList(list.filter(id => id !== productId));
    } else {
      setList([...list, productId]);
    }
  };

  // Toggle category selection
  const toggleCategorySelection = (categoryId: string) => {
    if (featuredCategories.includes(categoryId)) {
      setFeaturedCategories(featuredCategories.filter(id => id !== categoryId));
    } else {
      setFeaturedCategories([...featuredCategories, categoryId]);
    }
  };

  // Special Offer Modal
  const openOfferModal = (offer?: SpecialOffer) => {
    if (offer) {
      setEditOffer(offer);
      setOfferTitle(offer.title);
      setOfferDescription(offer.description || "");
      setOfferMediaType(offer.mediaType);
      setOfferLinkType(offer.linkType);
      setOfferLinkId(offer.linkId || "");
      setOfferExternalUrl(offer.externalUrl || "");
      setOfferRank(String(offer.rank));
      setOfferStartDate(offer.startDate?.split("T")[0] || "");
      setOfferEndDate(offer.endDate?.split("T")[0] || "");
    } else {
      setEditOffer(null);
      setOfferTitle("");
      setOfferDescription("");
      setOfferMediaType("image");
      setOfferLinkType("product");
      setOfferLinkId("");
      setOfferExternalUrl("");
      setOfferRank("0");
      setOfferStartDate("");
      setOfferEndDate("");
    }
    setOfferFile(null);
    setOfferModalOpen(true);
  };

  const handleSaveOffer = async () => {
    if (!offerTitle.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", offerTitle);
      formData.append("description", offerDescription);
      formData.append("mediaType", offerMediaType);
      formData.append("linkType", offerLinkType);
      formData.append("rank", offerRank);
      if (offerLinkType !== "external" && offerLinkId) {
        formData.append("linkId", offerLinkId);
      }
      if (offerLinkType === "external" && offerExternalUrl) {
        formData.append("externalUrl", offerExternalUrl);
      }
      if (offerStartDate) formData.append("startDate", offerStartDate);
      if (offerEndDate) formData.append("endDate", offerEndDate);
      if (offerFile) formData.append("media", offerFile);

      if (editOffer) {
        await homeScreenService.updateSpecialOffer(editOffer._id, formData);
        toast.success("Offer updated");
      } else {
        await homeScreenService.createSpecialOffer(formData);
        toast.success("Offer created");
      }
      setOfferModalOpen(false);
      loadData();
    } catch {
      toast.error("Failed to save offer");
    } finally {
      setSaving(false);
    }
  };

  // Collection Modal
  const openCollectionModal = (collection?: FeaturedCollection) => {
    if (collection) {
      setEditCollection(collection);
      setCollectionTitle(collection.title);
      setCollectionSubtitle(collection.subtitle || "");
      setCollectionLinkType(collection.linkType);
      setCollectionLinkId(collection.linkId || "");
      setCollectionRank(String(collection.rank));
      setCollectionSize(collection.size);
    } else {
      setEditCollection(null);
      setCollectionTitle("");
      setCollectionSubtitle("");
      setCollectionLinkType("category");
      setCollectionLinkId("");
      setCollectionRank("0");
      setCollectionSize("small");
    }
    setCollectionFile(null);
    setCollectionModalOpen(true);
  };

  const handleSaveCollection = async () => {
    if (!collectionTitle.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", collectionTitle);
      formData.append("subtitle", collectionSubtitle);
      formData.append("linkType", collectionLinkType);
      formData.append("rank", collectionRank);
      formData.append("size", collectionSize);
      if (collectionLinkId) formData.append("linkId", collectionLinkId);
      if (collectionFile) formData.append("image", collectionFile);

      if (editCollection) {
        await homeScreenService.updateFeaturedCollection(editCollection._id, formData);
        toast.success("Collection updated");
      } else {
        await homeScreenService.createFeaturedCollection(formData);
        toast.success("Collection created");
      }
      setCollectionModalOpen(false);
      loadData();
    } catch {
      toast.error("Failed to save collection");
    } finally {
      setSaving(false);
    }
  };

  // Delete handlers
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      if (deleteConfirm.type === "offer") {
        await homeScreenService.deleteSpecialOffer(deleteConfirm.id);
        toast.success("Offer deleted");
      } else {
        await homeScreenService.deleteFeaturedCollection(deleteConfirm.id);
        toast.success("Collection deleted");
      }
      setDeleteConfirm(null);
      loadData();
    } catch {
      toast.error("Failed to delete");
    }
  };

  // Toggle status handlers
  const handleToggleOfferStatus = async (id: string) => {
    try {
      await homeScreenService.toggleSpecialOfferStatus(id);
      loadData();
    } catch {
      toast.error("Failed to toggle status");
    }
  };

  const handleToggleCollectionStatus = async (id: string) => {
    try {
      await homeScreenService.toggleCollectionStatus(id);
      loadData();
    } catch {
      toast.error("Failed to toggle status");
    }
  };

  // Filter products by search
  const filteredProducts = allProducts.filter(p =>
    p.productName.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.brand?.toLowerCase().includes(productSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Home Screen Management</h1>
          <p className="text-gray-600 mt-1">Configure what appears on the mobile app home screen</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex flex-wrap gap-2 -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-[#B8860B] text-[#B8860B]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {/* Gold Prices Tab */}
        {activeTab === "prices" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Live Gold & Silver Prices</h2>
            <p className="text-gray-600 text-sm">Set the live prices that will be displayed on the home screen ticker</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gold Price (22K) per gram
                </label>
                <Input
                  type="number"
                  value={price22K}
                  onChange={(e) => setPrice22K(e.target.value)}
                  placeholder="Enter 22K gold price"
                  prefix="₹"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gold Price (24K) per gram
                </label>
                <Input
                  type="number"
                  value={price24K}
                  onChange={(e) => setPrice24K(e.target.value)}
                  placeholder="Enter 24K gold price"
                  prefix="₹"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Silver Price per gram
                </label>
                <Input
                  type="number"
                  value={silverPrice}
                  onChange={(e) => setSilverPrice(e.target.value)}
                  placeholder="Enter silver price"
                  prefix="₹"
                />
              </div>
            </div>

            <Button onClick={handleSavePrices} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Prices"}
            </Button>
          </div>
        )}

        {/* Featured Products Tab */}
        {activeTab === "featured" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">Featured Products</h2>
                <p className="text-gray-600 text-sm">Select products to feature on the home screen ({featuredProducts.length} selected)</p>
              </div>
              <Button onClick={handleSaveFeaturedProducts} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Selection"}
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-125 overflow-y-auto">
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  onClick={() => toggleProductSelection(product._id, featuredProducts, setFeaturedProducts)}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    featuredProducts.includes(product._id)
                      ? "border-[#B8860B] bg-[#fdf8ec]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className={`w-5 h-5 rounded flex items-center justify-center ${
                    featuredProducts.includes(product._id) ? "bg-[#B8860B]" : "border border-gray-300"
                  }`}>
                    {featuredProducts.includes(product._id) && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <img
                    src={product.productImages[0]?.url || PLACEHOLDER_IMAGE}
                    alt={product.productName}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.productName}</p>
                    <p className="text-xs text-gray-500">{formatCurrency(product.discountPrice)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Best Sellers Tab */}
        {activeTab === "bestsellers" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">Best Seller Products</h2>
                <p className="text-gray-600 text-sm">Select products to show in Best Sellers section ({bestSellers.length} selected)</p>
              </div>
              <Button onClick={handleSaveBestSellers} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Selection"}
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-125 overflow-y-auto">
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  onClick={() => toggleProductSelection(product._id, bestSellers, setBestSellers)}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    bestSellers.includes(product._id)
                      ? "border-[#B8860B] bg-[#fdf8ec]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className={`w-5 h-5 rounded flex items-center justify-center ${
                    bestSellers.includes(product._id) ? "bg-[#B8860B]" : "border border-gray-300"
                  }`}>
                    {bestSellers.includes(product._id) && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <img
                    src={product.productImages[0]?.url || PLACEHOLDER_IMAGE}
                    alt={product.productName}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.productName}</p>
                    <p className="text-xs text-gray-500">{formatCurrency(product.discountPrice)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Arrivals Tab */}
        {activeTab === "arrivals" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">New Arrivals</h2>
                <p className="text-gray-600 text-sm">Select products to show in New Arrivals (max 5 recommended, {newArrivals.length} selected)</p>
              </div>
              <Button onClick={handleSaveNewArrivals} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Selection"}
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-125 overflow-y-auto">
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  onClick={() => toggleProductSelection(product._id, newArrivals, setNewArrivals)}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    newArrivals.includes(product._id)
                      ? "border-[#B8860B] bg-[#fdf8ec]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className={`w-5 h-5 rounded flex items-center justify-center ${
                    newArrivals.includes(product._id) ? "bg-[#B8860B]" : "border border-gray-300"
                  }`}>
                    {newArrivals.includes(product._id) && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <img
                    src={product.productImages[0]?.url || PLACEHOLDER_IMAGE}
                    alt={product.productName}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.productName}</p>
                    <p className="text-xs text-gray-500">{formatCurrency(product.discountPrice)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Featured Categories Tab */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">Featured Categories</h2>
                <p className="text-gray-600 text-sm">Select categories to show on the home screen ({featuredCategories.length} selected)</p>
              </div>
              <Button onClick={handleSaveFeaturedCategories} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Selection"}
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {allCategories.map((category) => (
                <div
                  key={category._id}
                  onClick={() => toggleCategorySelection(category._id)}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    featuredCategories.includes(category._id)
                      ? "border-[#B8860B] bg-[#fdf8ec]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className={`w-5 h-5 rounded flex items-center justify-center ${
                    featuredCategories.includes(category._id) ? "bg-[#B8860B]" : "border border-gray-300"
                  }`}>
                    {featuredCategories.includes(category._id) && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <img
                    src={category.image || PLACEHOLDER_IMAGE}
                    alt={category.categoryName}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{category.categoryName}</p>
                    <div className="mt-1">
                      <Badge variant={category.isActive ? "success" : "danger"}>
                        {category.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Special Offers Tab */}
        {activeTab === "offers" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">Special Offers</h2>
                <p className="text-gray-600 text-sm">Manage promotional offers (images, GIFs, or videos)</p>
              </div>
              <Button onClick={() => openOfferModal()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Offer
              </Button>
            </div>

            <Table
              data={specialOffers}
              columns={[
                {
                  key: "title",
                  header: "Offer",
                  render: (offer: SpecialOffer) => (
                    <div className="flex items-center gap-3">
                      {offer.mediaUrl ? (
                        offer.mediaType === "video" ? (
                          <div className="w-20 h-12 rounded bg-gray-100 flex items-center justify-center">
                            <Film className="w-5 h-5 text-gray-400" />
                          </div>
                        ) : (
                          <img src={offer.mediaUrl} alt={offer.title} className="w-20 h-12 rounded object-cover" />
                        )
                      ) : (
                        <div className="w-20 h-12 rounded bg-gray-100 flex items-center justify-center">
                          <FileImage className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{offer.title}</p>
                        <p className="text-xs text-gray-500">Type: {offer.mediaType}</p>
                      </div>
                    </div>
                  ),
                },
                {
                  key: "linkType",
                  header: "Link",
                  render: (offer: SpecialOffer) => (
                    <Badge variant="info">{offer.linkType}</Badge>
                  ),
                },
                {
                  key: "rank",
                  header: "Rank",
                  render: (offer: SpecialOffer) => <span>{offer.rank}</span>,
                },
                {
                  key: "isActive",
                  header: "Status",
                  render: (offer: SpecialOffer) => (
                    <Badge variant={offer.isActive ? "success" : "danger"}>
                      {offer.isActive ? "Active" : "Inactive"}
                    </Badge>
                  ),
                },
                {
                  key: "_id",
                  header: "Actions",
                  render: (offer: SpecialOffer) => (
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleToggleOfferStatus(offer._id)}>
                        <Power className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openOfferModal(offer)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm({ type: "offer", id: offer._id })}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        )}

        {/* Collections Tab */}
        {activeTab === "collections" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">Featured Collections</h2>
                <p className="text-gray-600 text-sm">Manage collection banners for the home screen</p>
              </div>
              <Button onClick={() => openCollectionModal()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Collection
              </Button>
            </div>

            <Table
              data={collections}
              columns={[
                {
                  key: "title",
                  header: "Collection",
                  render: (col: FeaturedCollection) => (
                    <div className="flex items-center gap-3">
                      {col.image ? (
                        <img src={col.image} alt={col.title} className="w-20 h-12 rounded object-cover" />
                      ) : (
                        <div className="w-20 h-12 rounded bg-gray-100 flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{col.title}</p>
                        {col.subtitle && <p className="text-xs text-gray-500">{col.subtitle}</p>}
                      </div>
                    </div>
                  ),
                },
                {
                  key: "size",
                  header: "Size",
                  render: (col: FeaturedCollection) => (
                    <Badge variant={col.size === "large" ? "info" : "default"}>{col.size}</Badge>
                  ),
                },
                {
                  key: "rank",
                  header: "Rank",
                  render: (col: FeaturedCollection) => <span>{col.rank}</span>,
                },
                {
                  key: "isActive",
                  header: "Status",
                  render: (col: FeaturedCollection) => (
                    <Badge variant={col.isActive ? "success" : "danger"}>
                      {col.isActive ? "Active" : "Inactive"}
                    </Badge>
                  ),
                },
                {
                  key: "_id",
                  header: "Actions",
                  render: (col: FeaturedCollection) => (
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleToggleCollectionStatus(col._id)}>
                        <Power className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openCollectionModal(col)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm({ type: "collection", id: col._id })}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        )}
      </div>

      {/* Special Offer Modal */}
      <Modal
        isOpen={offerModalOpen}
        onClose={() => setOfferModalOpen(false)}
        title={editOffer ? "Edit Special Offer" : "Create Special Offer"}
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={offerTitle}
            onChange={(e) => setOfferTitle(e.target.value)}
            placeholder="Offer title"
            required
          />
          <Input
            label="Description"
            value={offerDescription}
            onChange={(e) => setOfferDescription(e.target.value)}
            placeholder="Offer description (optional)"
          />
          <Select
            label="Media Type"
            value={offerMediaType}
            onChange={(e) => setOfferMediaType(e.target.value as "image" | "gif" | "video")}
            options={[
              { value: "image", label: "Image" },
              { value: "gif", label: "GIF" },
              { value: "video", label: "Video" },
            ]}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Media</label>
            <input
              type="file"
              accept={offerMediaType === "video" ? "video/*" : "image/*"}
              onChange={(e) => setOfferFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-[#fdf8ec] file:text-[#B8860B] hover:file:bg-[#f8d7e0]"
            />
          </div>
          <Select
            label="Link Type"
            value={offerLinkType}
            onChange={(e) => setOfferLinkType(e.target.value as "product" | "category" | "external")}
            options={[
              { value: "product", label: "Product" },
              { value: "category", label: "Category" },
              { value: "external", label: "External URL" },
            ]}
          />
          {offerLinkType === "product" && (
            <Select
              label="Select Product"
              value={offerLinkId}
              onChange={(e) => setOfferLinkId(e.target.value)}
              options={[
                { value: "", label: "Select a product..." },
                ...allProducts.map((p) => ({ value: p._id, label: p.productName })),
              ]}
            />
          )}
          {offerLinkType === "category" && (
            <Select
              label="Select Category"
              value={offerLinkId}
              onChange={(e) => setOfferLinkId(e.target.value)}
              options={[
                { value: "", label: "Select a category..." },
                ...allCategories.map((c) => ({ value: c._id, label: c.categoryName })),
              ]}
            />
          )}
          {offerLinkType === "external" && (
            <Input
              label="External URL"
              value={offerExternalUrl}
              onChange={(e) => setOfferExternalUrl(e.target.value)}
              placeholder="https://example.com"
            />
          )}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Rank"
              type="number"
              value={offerRank}
              onChange={(e) => setOfferRank(e.target.value)}
              min="0"
            />
            <Input
              label="Start Date"
              type="date"
              value={offerStartDate}
              onChange={(e) => setOfferStartDate(e.target.value)}
            />
          </div>
          <Input
            label="End Date"
            type="date"
            value={offerEndDate}
            onChange={(e) => setOfferEndDate(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setOfferModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveOffer} disabled={saving}>
              {saving ? "Saving..." : editOffer ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Collection Modal */}
      <Modal
        isOpen={collectionModalOpen}
        onClose={() => setCollectionModalOpen(false)}
        title={editCollection ? "Edit Collection" : "Create Collection"}
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={collectionTitle}
            onChange={(e) => setCollectionTitle(e.target.value)}
            placeholder="Collection title"
            required
          />
          <Input
            label="Subtitle"
            value={collectionSubtitle}
            onChange={(e) => setCollectionSubtitle(e.target.value)}
            placeholder="Collection subtitle (optional)"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Collection Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCollectionFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-[#fdf8ec] file:text-[#B8860B] hover:file:bg-[#f8d7e0]"
            />
          </div>
          <Select
            label="Size"
            value={collectionSize}
            onChange={(e) => setCollectionSize(e.target.value as "large" | "small")}
            options={[
              { value: "large", label: "Large (Featured)" },
              { value: "small", label: "Small" },
            ]}
          />
          <Select
            label="Link Type"
            value={collectionLinkType}
            onChange={(e) => setCollectionLinkType(e.target.value as "category" | "products" | "custom")}
            options={[
              { value: "category", label: "Category" },
              { value: "products", label: "Products" },
              { value: "custom", label: "Custom" },
            ]}
          />
          {collectionLinkType === "category" && (
            <Select
              label="Select Category"
              value={collectionLinkId}
              onChange={(e) => setCollectionLinkId(e.target.value)}
              options={[
                { value: "", label: "Select a category..." },
                ...allCategories.map((c) => ({ value: c._id, label: c.categoryName })),
              ]}
            />
          )}
          <Input
            label="Rank"
            type="number"
            value={collectionRank}
            onChange={(e) => setCollectionRank(e.target.value)}
            min="0"
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setCollectionModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCollection} disabled={saving}>
              {saving ? "Saving..." : editCollection ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title={`Delete ${deleteConfirm?.type === "offer" ? "Offer" : "Collection"}`}
        message={`Are you sure you want to delete this ${deleteConfirm?.type}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
