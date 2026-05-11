import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  ToggleLeft,
  ToggleRight,
  Star,
  Filter,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Table } from "../../components/ui/Table";
import { Pagination } from "../../components/ui/Pagination";
import { Badge } from "../../components/ui/Badge";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { useToast } from "../../store/toastStore";
import { productService } from "../../services/productService";
import { categoryService } from "../../services/categoryService";
import { formatCurrency, PLACEHOLDER_IMAGE } from "../../lib/utils";
import type { Product, Category } from "../../types";

export const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  // Delete state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toast = useToast();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [page, search, categoryFilter, statusFilter]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await productService.getProducts(page, limit, search, categoryFilter, statusFilter);
      if (res.code === 1) {
        setProducts(res.data.products);
        setTotal(res.data.total);
      }
    } catch (error) {
      toast.error("Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getAllCategories();
      if (res.code === 1) {
        setCategories(res.data.categories);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    setIsSubmitting(true);
    try {
      await productService.deleteProduct(selectedProduct._id);
      toast.success("Product deleted successfully!");
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
      fetchProducts();
    } catch (error) {
      toast.error("Failed to delete product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (product: Product) => {
    try {
      await productService.toggleStatus(product._id, !product.isActive);
      toast.success(
        `Product ${product.isActive ? "deactivated" : "activated"} successfully!`,
      );
      fetchProducts();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    try {
      await productService.toggleFeatured(product._id, !product.isFeatured);
      toast.success(
        `Product ${product.isFeatured ? "removed from" : "added to"} featured!`,
      );
      fetchProducts();
    } catch (error) {
      toast.error("Failed to update featured status");
    }
  };



  const columns = [
    {
      key: "product",
      header: "Product",
      render: (product: Product) => (
        <div className="flex items-center space-x-3">
          <img
            src={
              product.productImages[0]?.url || PLACEHOLDER_IMAGE
            }
            alt={product.productName}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div>
            <p className="font-medium text-gray-900">{product.productName}</p>
            <p className="text-sm text-gray-500">{product.brand}</p>
          </div>
        </div>
      ),
    },
    {
      key: "price",
      header: "Price",
      render: (product: Product) => (
        <div>
          <p className="font-medium text-gray-900">
            {formatCurrency(product.discountPrice)}
          </p>
          {product.discountPercent > 0 && (
            <p className="text-sm text-gray-500 line-through">
              {formatCurrency(product.price)}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "stock",
      header: "Stock",
      render: (product: Product) => (
        <Badge
          variant={
            product.stock > 10
              ? "success"
              : product.stock > 0
                ? "warning"
                : "danger"
          }
        >
          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
        </Badge>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      render: (product: Product) => (
        <div className="flex items-center">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="ml-1 text-sm font-medium">
            {product.rating.toFixed(1)}
          </span>
          <span className="ml-1 text-sm text-gray-500">
            ({product.totalRatings})
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (product: Product) => (
        <div className="flex items-center space-x-2">
          <Badge variant={product.isActive ? "success" : "danger"}>
            {product.isActive ? "Active" : "Inactive"}
          </Badge>
          {product.isFeatured && <Badge variant="info">Featured</Badge>}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (product: Product) => (
        <div className="flex items-center space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/products/${product._id}`);
            }}
            className="p-1 text-gray-500 hover:text-blue-600"
            title="View"
          >
            <Eye className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleFeatured(product);
            }}
            className={`p-1 ${product.isFeatured ? "text-yellow-500" : "text-gray-400"} hover:text-yellow-600`}
            title={
              product.isFeatured ? "Remove from Featured" : "Add to Featured"
            }
          >
            <Star
              className={`w-5 h-5 ${product.isFeatured ? "fill-current" : ""}`}
            />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleStatus(product);
            }}
            className="p-1 text-gray-500 hover:text-[#B8860B]"
            title={product.isActive ? "Deactivate" : "Activate"}
          >
            {product.isActive ? (
              <ToggleRight className="w-5 h-5 text-green-600" />
            ) : (
              <ToggleLeft className="w-5 h-5 text-gray-400" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/products/${product._id}/edit`);
            }}
            className="p-1 text-gray-500 hover:text-[#B8860B]"
            title="Edit"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedProduct(product);
              setIsDeleteDialogOpen(true);
            }}
            className="p-1 text-gray-500 hover:text-red-600"
            title="Delete"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1">Manage your products</p>
        </div>
        <Button
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate("/products/new")}
        >
          Add Product
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search products..."
              leftIcon={<Search className="w-5 h-5" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            leftIcon={<Filter className="w-4 h-4" />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
            <Select
              label="Category"
              options={[
                { value: "", label: "All Categories" },
                ...categories.map((c) => ({
                  value: c._id,
                  label: c.categoryName,
                })),
              ]}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            />
            <Select
              label="Status"
              options={[
                { value: "", label: "All Status" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
            <div className="flex items-end">
              <Button
                variant="ghost"
                onClick={() => {
                  setCategoryFilter("");
                  setStatusFilter("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text="Loading products..." />
        </div>
      ) : (
        <>
          <Table
            columns={columns}
            data={products}
            emptyMessage="No products found"
          />
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(total / limit)}
            onPageChange={setPage}
            totalItems={total}
            itemsPerPage={limit}
          />
        </>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${selectedProduct?.productName}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={isSubmitting}
      />
    </div>
  );
};
