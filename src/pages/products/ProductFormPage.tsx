import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, X, Plus, Box, Upload } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { useToast } from "../../store/toastStore";
import { productService } from "../../services/productService";
import { categoryService } from "../../services/categoryService";
import type { Category } from "../../types";

export const ProductFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEdit);
  const [categories, setCategories] = useState<Category[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    productName: "",
    brand: "",
    categoryId: "",
    material: "",
    price: "",
    discountPrice: "",
    discountPercent: "",
    stock: "",
    description: "",
    features: "",
    isFeatured: false,
    isActive: true,
    // Gold-pricing fields. When goldPricingEnabled is true, the website
    // shows a computed price = weight × ((purity + makingCharge)/100) × 24K rate
    // and the static `price` field becomes a fallback for non-gold items.
    goldPricingEnabled: false,
    weightGrams: "",
    goldPurityPercent: "",
    makingChargePercent: "",
  });
  const [live24KRate, setLive24KRate] = useState<number | null>(null);

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [rotationImageFiles, setRotationImageFiles] = useState<File[]>([]);
  const [existingRotationImages, setExistingRotationImages] = useState<
    string[]
  >([]);
  const [model3dFile, setModel3dFile] = useState<File | null>(null);
  const [existingModel3dUrl, setExistingModel3dUrl] = useState("");
  const [arModelFile, setArModelFile] = useState<File | null>(null);
  const [existingArModelUrl, setExistingArModelUrl] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toast = useToast();

  useEffect(() => {
    fetchCategories();
    fetchLiveRate();
    if (isEdit && id) {
      fetchProduct(id);
    }
  }, [id]);

  // Pull the live (marked-up) 24K rate from the gold-rate-markup admin API.
  // We reuse the admin endpoint that already returns liveRate so we don't
  // need a new route. Safe to fail silently — the calculator just hides.
  const fetchLiveRate = async () => {
    try {
      const { goldRateMarkupService } = await import(
        "../../services/goldRateMarkupService"
      );
      const res = await goldRateMarkupService.getAll();
      const r24 =
        Array.isArray(res?.data)
          ? res.data.find((r) => r.karat === "24K")
          : null;
      const final =
        r24?.finalRate ??
        (r24?.liveRate != null
          ? Math.round(
              r24.liveRate * (1 + (r24.percent || 0) / 100) + (r24.flat || 0),
            )
          : null);
      if (final != null) setLive24KRate(final);
    } catch {
      // ignore — calculator falls back to a hint
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getAllCategories();
      if (res.code === 1) {
        setCategories(res.data.categories);
      }
    } catch {
      toast.error("Failed to load categories");
    }
  };

  const fetchProduct = async (productId: string) => {
    setIsFetching(true);
    try {
      const res = await productService.getProduct(productId);
      if (res.code === 1) {
        const p = res.data;
        // The backend populates categoryId as { _id, categoryName }; the
        // <select> matches options by string id, so extract the id (otherwise
        // the dropdown silently falls back to the first category and saving
        // sends "[object Object]", which fails to cast → "failed to update").
        const catRaw: any = p.categoryId;
        const categoryIdStr =
          catRaw && typeof catRaw === "object" ? catRaw._id : catRaw || "";
        setFormData({
          productName: p.productName || "",
          brand: p.brand || "",
          categoryId: categoryIdStr,
          material: (p as any).material || "",
          price: String(p.price || ""),
          discountPrice: String(p.discountPrice || ""),
          discountPercent: String(p.discountPercent || ""),
          stock: String(p.stock || ""),
          description: p.description || "",
          features: p.features || "",
          isFeatured: p.isFeatured || false,
          isActive: p.isActive !== false,
          goldPricingEnabled: p.goldPricing?.isEnabled || false,
          weightGrams: String(p.goldPricing?.weightGrams ?? ""),
          goldPurityPercent: String(p.goldPricing?.goldPurityPercent ?? ""),
          makingChargePercent: String(p.goldPricing?.makingChargePercent ?? ""),
        });
        setExistingImages(
          p.productImages?.map((img) => img.url).filter(Boolean) || [],
        );
        setExistingRotationImages(
          [...(p.rotationImages || [])]
            .sort((a, b) => a.order - b.order)
            .map((img) => img.url)
            .filter(Boolean),
        );
        setExistingModel3dUrl(p.model3dUrl || "");
        setExistingArModelUrl(p.arModelUrl || "");
      }
    } catch {
      toast.error("Failed to load product");
      navigate("/products");
    } finally {
      setIsFetching(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Auto-calculate discount percent when price and discountPrice change
    if (name === "price" || name === "discountPrice") {
      const price =
        name === "price" ? parseFloat(value) : parseFloat(formData.price);
      const discountPrice =
        name === "discountPrice"
          ? parseFloat(value)
          : parseFloat(formData.discountPrice);
      if (price > 0 && discountPrice > 0 && discountPrice < price) {
        const percent = Math.round(((price - discountPrice) / price) * 100);
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          discountPercent: String(percent),
        }));
        return;
      }
    }

    // Clear error for field
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imageFiles.length + existingImages.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }
    setImageFiles((prev) => [...prev, ...files]);
    // Reset input
    e.target.value = "";
  };

  const removeNewImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  // 360° turntable frames — same add/remove pattern as product images, but
  // uploading new frames replaces the whole existing set (order matters and
  // the backend just re-numbers by upload order, so partial merges would be
  // ambiguous). No hard cap other than a sane upper bound for a turntable set.
  const handleRotationImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + rotationImageFiles.length > 60) {
      toast.error("Maximum 60 rotation frames allowed");
      return;
    }
    setRotationImageFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const removeNewRotationImage = (index: number) => {
    setRotationImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingRotationImage = (index: number) => {
    setExistingRotationImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleModel3dChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setModel3dFile(file);
    e.target.value = "";
  };

  const handleArModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setArModelFile(file);
    e.target.value = "";
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.productName.trim())
      newErrors.productName = "Product name is required";
    if (!formData.categoryId) newErrors.categoryId = "Category is required";
    if (!formData.price || parseFloat(formData.price) <= 0)
      newErrors.price = "Valid price is required";
    if (!formData.stock || parseInt(formData.stock) < 0)
      newErrors.stock = "Valid stock quantity is required";
    if (
      !isEdit &&
      imageFiles.length === 0
    )
      newErrors.images = "At least one product image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const fd = new FormData();
      fd.append("productName", formData.productName.trim());
      fd.append("brand", formData.brand.trim());
      fd.append("categoryId", formData.categoryId);
      fd.append("material", formData.material);
      fd.append("price", formData.price);
      fd.append("discountPrice", formData.discountPrice || "0");
      fd.append("discountPercent", formData.discountPercent || "0");
      fd.append("stock", formData.stock);
      fd.append("description", formData.description.trim());
      fd.append("features", formData.features.trim());
      fd.append("isFeatured", String(formData.isFeatured));
      fd.append("isActive", String(formData.isActive));

      // Gold pricing — sent as a JSON blob the backend can deserialize. Empty
      // fields fall back to 0 server-side.
      fd.append(
        "goldPricing",
        JSON.stringify({
          isEnabled: formData.goldPricingEnabled,
          weightGrams: Number(formData.weightGrams) || 0,
          goldPurityPercent: Number(formData.goldPurityPercent) || 0,
          makingChargePercent: Number(formData.makingChargePercent) || 0,
        }),
      );

      // Append new image files
      for (const file of imageFiles) {
        fd.append("productImages", file);
      }

      // 360° frames — append in the order shown, which becomes playback order
      for (const file of rotationImageFiles) {
        fd.append("rotationImages", file);
      }

      if (model3dFile) fd.append("model3d", model3dFile);
      if (arModelFile) fd.append("arModel", arModelFile);

      if (isEdit && id) {
        await productService.updateProduct(id, fd);
        toast.success("Product updated successfully!");
      } else {
        await productService.createProduct(fd);
        toast.success("Product created successfully!");
      }

      navigate("/products");
    } catch {
      toast.error("Failed to save product");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" text="Loading product..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/products")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEdit
              ? "Update product details"
              : "Add a new product to your catalog"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Product Name"
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              placeholder="e.g., Gold Necklace Set"
              error={errors.productName}
              required
            />
            <Input
              label="Brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="e.g., Tanishq"
            />
          </div>

          <Select
            label="Category"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            options={categories.map((c) => ({
              value: c._id,
              label: c.categoryName,
            }))}
            placeholder="Select a category"
            required
          />
          {errors.categoryId && (
            <p className="text-sm text-red-500 -mt-2">{errors.categoryId}</p>
          )}

          <Select
            label="Material"
            name="material"
            value={formData.material}
            onChange={handleChange}
            options={[
              "22K Gold",
              "18K Gold",
              "24K Gold",
              "999 Silver",
              "Rose Gold",
              "Pearl",
              "Stone",
              "Diamond",
            ].map((m) => ({ value: m, label: m }))}
            placeholder="Select a material (optional)"
          />
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Pricing</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Price (INR)"
              name="price"
              type="number"
              min="0"
              step="1"
              value={formData.price}
              onChange={handleChange}
              placeholder="e.g., 25000"
              error={errors.price}
              required
            />
            <Input
              label="Discount Price (INR)"
              name="discountPrice"
              type="number"
              min="0"
              step="1"
              value={formData.discountPrice}
              onChange={handleChange}
              placeholder="e.g., 22000"
            />
            <Input
              label="Discount %"
              name="discountPercent"
              type="number"
              min="0"
              max="100"
              value={formData.discountPercent}
              onChange={handleChange}
              placeholder="Auto-calculated"
            />
          </div>

          <Input
            label="Stock Quantity"
            name="stock"
            type="number"
            min="0"
            value={formData.stock}
            onChange={handleChange}
            placeholder="e.g., 50"
            error={errors.stock}
            required
          />
        </div>

        {/* Gold Pricing (optional, live-calculated) */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Gold Pricing</h2>
              <p className="text-sm text-gray-500 mt-1">
                Compute the customer price live from the 24K rate using
                weight × (purity% + making%) × rate. Leave disabled for fixed-price items.
              </p>
            </div>
            <label className="inline-flex items-center gap-2 cursor-pointer shrink-0">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={formData.goldPricingEnabled}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    goldPricingEnabled: e.target.checked,
                  }))
                }
              />
              <span className="w-10 h-6 rounded-full bg-gray-200 peer-checked:bg-[#B8860B] relative transition-colors">
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 bg-white rounded-full transition-transform ${
                    formData.goldPricingEnabled ? "translate-x-4" : ""
                  }`}
                />
              </span>
              <span className="text-sm text-gray-700">
                {formData.goldPricingEnabled ? "Enabled" : "Disabled"}
              </span>
            </label>
          </div>

          {formData.goldPricingEnabled && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Item weight (g)"
                  name="weightGrams"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.weightGrams}
                  onChange={handleChange}
                  placeholder="e.g. 1.2"
                />
                <Input
                  label="Gold purity (%)"
                  name="goldPurityPercent"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.goldPurityPercent}
                  onChange={handleChange}
                  placeholder="e.g. 25"
                  helperText="The percentage of pure gold in this item."
                />
                <Input
                  label="Making charge (%)"
                  name="makingChargePercent"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.makingChargePercent}
                  onChange={handleChange}
                  placeholder="e.g. 10"
                />
              </div>

              {(() => {
                // Live preview mirrors backend math:
                //   weight × ((purity + making) / 100) × rate24K
                const w = Number(formData.weightGrams) || 0;
                const pur = Number(formData.goldPurityPercent) || 0;
                const mak = Number(formData.makingChargePercent) || 0;
                const combinedPct = pur + mak;
                const goldEq = w * (combinedPct / 100);
                const rate = live24KRate || 0;
                const computed = Math.round(goldEq * rate);
                return (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <div className="text-amber-900 font-medium">
                          Live preview
                        </div>
                        <div className="text-xs text-amber-700 mt-0.5">
                          {w}g × ({pur}% + {mak}%) = {goldEq.toFixed(4)}g of 24K
                          {rate > 0 && (
                            <>
                              {" "}
                              × ₹{rate.toLocaleString("en-IN")}
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-xl font-bold text-amber-900">
                        {rate > 0
                          ? `₹${computed.toLocaleString("en-IN")}`
                          : "Rate unavailable"}
                      </div>
                    </div>
                    {rate === 0 && (
                      <p className="text-xs text-amber-700 mt-2">
                        Configure the live 24K rate in System Management → Gold
                        Rate. The product will still compute price at request
                        time using whatever rate is current then.
                      </p>
                    )}
                  </div>
                );
              })()}
            </>
          )}
        </div>

        {/* Images */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Product Images
          </h2>
          <p className="text-sm text-gray-500">
            Upload up to 5 product images. First image will be the main display
            image.
          </p>

          <div className="flex flex-wrap gap-4">
            {/* Existing images */}
            {existingImages.map((url, i) => (
              <div key={`existing-${i}`} className="relative group">
                <img
                  src={url}
                  alt={`Product ${i + 1}`}
                  className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removeExistingImage(i)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* New image previews */}
            {imageFiles.map((file, i) => (
              <div key={`new-${i}`} className="relative group">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`New ${i + 1}`}
                  className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removeNewImage(i)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Add image button */}
            {existingImages.length + imageFiles.length < 5 && (
              <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#B8860B] hover:bg-[#fdf8ec] transition-colors">
                <Plus className="w-6 h-6 text-gray-400" />
                <span className="text-xs text-gray-500 mt-1">Add</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageAdd}
                />
              </label>
            )}
          </div>
          {errors.images && (
            <p className="text-sm text-red-500">{errors.images}</p>
          )}
        </div>

        {/* 360° Turntable Images */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            360° Turntable Images (optional)
          </h2>
          <p className="text-sm text-gray-500">
            Powers the 360° spin viewer on the product page. Upload 20-36
            photos of the product shot on a turntable, one every 10-15°, in
            rotation order — the order you add them here is the order they'll
            play in. Leave empty to skip 360° for this product.
          </p>

          <div className="flex flex-wrap gap-3">
            {existingRotationImages.map((url, i) => (
              <div key={`existing-rot-${i}`} className="relative group">
                <img
                  src={url}
                  alt={`Frame ${i + 1}`}
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                />
                <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center rounded-b-lg">
                  {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeExistingRotationImage(i)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {rotationImageFiles.map((file, i) => (
              <div key={`new-rot-${i}`} className="relative group">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`New frame ${i + 1}`}
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                />
                <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center rounded-b-lg">
                  {existingRotationImages.length + i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeNewRotationImage(i)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <label className="w-16 h-16 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#B8860B] hover:bg-[#fdf8ec] transition-colors">
              <Plus className="w-5 h-5 text-gray-400" />
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleRotationImageAdd}
              />
            </label>
          </div>
          {rotationImageFiles.length > 0 && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Saving will replace the existing 360° set with these{" "}
              {rotationImageFiles.length} new frame
              {rotationImageFiles.length === 1 ? "" : "s"} (in the order shown
              above).
            </p>
          )}
        </div>

        {/* 3D / AR Model */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            3D / AR Model (optional)
          </h2>
          <p className="text-sm text-gray-500">
            Powers the 3D/AR viewer on the product page. Requires an actual 3D
            model of the product (from CAD files or a photogrammetry scan) —
            these aren't generated from photos automatically.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                3D model (.glb) — web &amp; Android AR
              </label>
              {model3dFile || existingModel3dUrl ? (
                <div className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg">
                  <Box className="w-4 h-4 text-[#B8860B] shrink-0" />
                  <span className="text-sm text-gray-700 truncate flex-1">
                    {model3dFile?.name || "Current model.glb"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setModel3dFile(null);
                      setExistingModel3dUrl("");
                    }}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#B8860B] hover:bg-[#fdf8ec] transition-colors">
                  <Upload className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Upload .glb file</span>
                  <input
                    type="file"
                    accept=".glb,.gltf"
                    className="hidden"
                    onChange={handleModel3dChange}
                  />
                </label>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                AR Quick Look (.usdz) — iOS only
              </label>
              {arModelFile || existingArModelUrl ? (
                <div className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg">
                  <Box className="w-4 h-4 text-[#B8860B] shrink-0" />
                  <span className="text-sm text-gray-700 truncate flex-1">
                    {arModelFile?.name || "Current model.usdz"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setArModelFile(null);
                      setExistingArModelUrl("");
                    }}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#B8860B] hover:bg-[#fdf8ec] transition-colors">
                  <Upload className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Upload .usdz file</span>
                  <input
                    type="file"
                    accept=".usdz"
                    className="hidden"
                    onChange={handleArModelChange}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Details</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the product in detail..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#B8860B] focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Features
            </label>
            <textarea
              name="features"
              rows={3}
              value={formData.features}
              onChange={handleChange}
              placeholder="Key features (e.g., 22K gold, BIS hallmarked)..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#B8860B] focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Flags */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Settings</h2>

          <div className="flex flex-col sm:flex-row gap-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-5 h-5 text-[#B8860B] border-gray-300 rounded focus:ring-[#B8860B]"
              />
              <div>
                <span className="font-medium text-gray-900">Active</span>
                <p className="text-sm text-gray-500">
                  Product is visible to customers
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="w-5 h-5 text-[#B8860B] border-gray-300 rounded focus:ring-[#B8860B]"
              />
              <div>
                <span className="font-medium text-gray-900">Featured</span>
                <p className="text-sm text-gray-500">
                  Show in featured products section
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/products")}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {isEdit ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </form>
    </div>
  );
};
