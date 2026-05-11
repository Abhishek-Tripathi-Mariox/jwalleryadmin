import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Table } from "../../components/ui/Table";
import { Pagination } from "../../components/ui/Pagination";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { useToast } from "../../store/toastStore";
import { categoryService } from "../../services/categoryService";
import { PLACEHOLDER_IMAGE } from "../../lib/utils";
import type { Category } from "../../types";

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    categoryName: "",
    isActive: true,
    showOnHomeScreen: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const toast = useToast();

  useEffect(() => {
    fetchCategories();
  }, [page, search]);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await categoryService.getCategories(page, limit, search);
      if (res.code === 1) {
        setCategories(res.data.categories);
        setTotal(res.data.total);
      }
    } catch (error) {
      toast.error("Failed to fetch categories");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setSelectedCategory(category);
      setFormData({
        categoryName: category.categoryName,
        isActive: category.isActive,
        showOnHomeScreen: category.showOnHomeScreen !== false,
      });
      setImagePreview(category.image);
    } else {
      setSelectedCategory(null);
      setFormData({ categoryName: "", isActive: true, showOnHomeScreen: true });
      setImagePreview("");
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
    setFormData({ categoryName: "", isActive: true, showOnHomeScreen: true });
    setImageFile(null);
    setImagePreview("");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("categoryName", formData.categoryName);
      formDataToSend.append("isActive", String(formData.isActive));
      formDataToSend.append("showOnHomeScreen", String(formData.showOnHomeScreen));
      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }

      if (selectedCategory) {
        await categoryService.updateCategory(selectedCategory._id, formDataToSend);
        toast.success("Category updated successfully!");
      } else {
        await categoryService.createCategory(formDataToSend);
        toast.success("Category created successfully!");
      }

      handleCloseModal();
      fetchCategories();
    } catch (error) {
      toast.error("Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;

    setIsSubmitting(true);
    try {
      await categoryService.deleteCategory(selectedCategory._id);
      toast.success("Category deleted successfully!");
      setIsDeleteDialogOpen(false);
      setSelectedCategory(null);
      fetchCategories();
    } catch (error) {
      toast.error("Failed to delete category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (category: Category) => {
    try {
      await categoryService.toggleStatus(category._id, !category.isActive);
      toast.success(
        `Category ${category.isActive ? "deactivated" : "activated"} successfully!`,
      );
      fetchCategories();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const columns = [
    {
      key: "image",
      header: "Image",
      render: (category: Category) => (
        <img
          src={category.image || PLACEHOLDER_IMAGE}
          alt={category.categoryName}
          className="w-12 h-12 rounded-lg object-cover"
        />
      ),
    },
    {
      key: "categoryName",
      header: "Category Name",
      render: (category: Category) => (
        <span className="font-medium">{category.categoryName}</span>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      render: (category: Category) => (
        <Badge variant={category.isActive ? "success" : "danger"}>
          {category.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Created At",
      render: (category: Category) =>
        new Date(category.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      render: (category: Category) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleStatus(category);
            }}
            className="p-1 text-gray-500 hover:text-[#B8860B]"
            title={category.isActive ? "Deactivate" : "Activate"}
          >
            {category.isActive ? (
              <ToggleRight className="w-5 h-5 text-green-600" />
            ) : (
              <ToggleLeft className="w-5 h-5 text-gray-400" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenModal(category);
            }}
            className="p-1 text-gray-500 hover:text-[#B8860B]"
            title="Edit"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedCategory(category);
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
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500 mt-1">Manage your product categories</p>
        </div>
        <Button
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => handleOpenModal()}
        >
          Add Category
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="max-w-md">
          <Input
            placeholder="Search categories..."
            leftIcon={<Search className="w-5 h-5" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text="Loading categories..." />
        </div>
      ) : (
        <>
          <Table
            columns={columns}
            data={categories}
            emptyMessage="No categories found"
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

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedCategory ? "Edit Category" : "Add Category"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Category Name"
            placeholder="Enter category name"
            value={formData.categoryName}
            onChange={(e) =>
              setFormData({ ...formData, categoryName: e.target.value })
            }
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Image
            </label>
            <div className="mt-1 flex items-center space-x-4">
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-20 h-20 rounded-lg object-cover"
                />
              )}
              <label className="cursor-pointer">
                <span className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                  {imagePreview ? "Change Image" : "Upload Image"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="w-4 h-4 text-[#B8860B] border-gray-300 rounded focus:ring-[#B8860B]"
            />
            <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
              Active
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="showOnHomeScreen"
              checked={formData.showOnHomeScreen}
              onChange={(e) =>
                setFormData({ ...formData, showOnHomeScreen: e.target.checked })
              }
              className="w-4 h-4 text-[#B8860B] border-gray-300 rounded focus:ring-[#B8860B]"
            />
            <label htmlFor="showOnHomeScreen" className="ml-2 text-sm text-gray-700">
              Show on Home Screen
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {selectedCategory ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${selectedCategory?.categoryName}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={isSubmitting}
      />
    </div>
  );
};
