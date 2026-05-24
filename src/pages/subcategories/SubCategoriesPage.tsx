import { useState, useEffect, useCallback } from "react";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import {
  subCategoryService,
  type SubCategory,
} from "../../services/subCategoryService";
import { categoryService } from "../../services/categoryService";
import type { Category } from "../../types";
import { useToast } from "../../store/toastStore";
import { Plus, Edit, Trash2, Power, FolderTree } from "lucide-react";

const parentId = (c: SubCategory["categoryId"]) =>
  typeof c === "string" ? c : c?._id || "";
const parentName = (c: SubCategory["categoryId"]) =>
  typeof c === "string" ? "" : c?.categoryName || "";

export function SubCategoriesPage() {
  const toast = useToast();
  const [subs, setSubs] = useState<SubCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editSub, setEditSub] = useState<SubCategory | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [rank, setRank] = useState("0");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fetchSubs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await subCategoryService.getSubCategories(1, 100, filterCat || undefined);
      if (res.code === 1 && res.data) setSubs(res.data.subCategories || []);
    } catch {
      toast.error("Failed to load subcategories");
    } finally {
      setLoading(false);
    }
  }, [filterCat]);

  useEffect(() => {
    categoryService.getAllCategories().then((res: any) => {
      if (res?.code === 1) setCategories(res.data?.categories || res.data || []);
    });
  }, []);

  useEffect(() => {
    fetchSubs();
  }, [fetchSubs]);

  const openCreate = () => {
    setEditSub(null);
    setName("");
    setCategoryId(filterCat || "");
    setRank("0");
    setImageFile(null);
    setModalOpen(true);
  };

  const openEdit = (s: SubCategory) => {
    setEditSub(s);
    setName(s.subCategoryName);
    setCategoryId(parentId(s.categoryId));
    setRank(String(s.rank));
    setImageFile(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return toast.error("Name is required");
    if (!categoryId) return toast.error("Parent category is required");
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("subCategoryName", name);
      fd.append("categoryId", categoryId);
      fd.append("rank", rank);
      if (imageFile) fd.append("image", imageFile);

      if (editSub) {
        await subCategoryService.updateSubCategory(editSub._id, fd);
        toast.success("Subcategory updated");
      } else {
        await subCategoryService.createSubCategory(fd);
        toast.success("Subcategory created");
      }
      setModalOpen(false);
      fetchSubs();
    } catch {
      toast.error("Failed to save subcategory");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await subCategoryService.deleteSubCategory(deleteConfirm);
      toast.success("Subcategory deleted");
      setDeleteConfirm(null);
      fetchSubs();
    } catch {
      toast.error("Failed to delete subcategory");
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await subCategoryService.toggleStatus(id);
      fetchSubs();
    } catch {
      toast.error("Failed to toggle status");
    }
  };

  const columns = [
    {
      key: "subCategoryName" as const,
      header: "Subcategory",
      render: (s: SubCategory) => (
        <div className="flex items-center gap-3">
          {s.image ? (
            <img src={s.image} alt={s.subCategoryName} className="h-10 w-10 rounded object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100">
              <FolderTree className="h-5 w-5 text-gray-400" />
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">{s.subCategoryName}</p>
            <p className="text-xs text-gray-500">Rank: {s.rank}</p>
          </div>
        </div>
      ),
    },
    {
      key: "categoryId" as const,
      header: "Parent category",
      render: (s: SubCategory) => (
        <span className="text-sm text-gray-700">
          {parentName(s.categoryId) ||
            categories.find((c) => c._id === parentId(s.categoryId))?.categoryName ||
            "—"}
        </span>
      ),
    },
    {
      key: "isActive" as const,
      header: "Status",
      render: (s: SubCategory) => (
        <Badge variant={s.isActive ? "success" : "danger"}>
          {s.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "_id" as const,
      header: "Actions",
      render: (s: SubCategory) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleToggle(s._id)}>
            <Power className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => openEdit(s)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(s._id)}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subcategories</h1>
          <p className="text-sm text-gray-500">Create and manage subcategories under each category</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add Subcategory
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600">Filter by category:</label>
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B8860B]"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.categoryName}</option>
          ))}
        </select>
      </div>

      <Table data={subs} columns={columns} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editSub ? "Edit Subcategory" : "Add Subcategory"}>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Parent Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B8860B]"
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.categoryName}</option>
              ))}
            </select>
          </div>
          <Input label="Subcategory Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Bridal Necklace" />
          <Input label="Rank (display order)" type="number" value={rank} onChange={(e) => setRank(e.target.value)} />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Image (optional)</label>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="block w-full text-sm" />
            {editSub?.image && !imageFile && (
              <img src={editSub.image} alt="Current" className="mt-2 h-16 w-16 rounded object-cover" />
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} isLoading={saving}>{editSub ? "Update" : "Create"}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Subcategory"
        message="Are you sure you want to delete this subcategory?"
        variant="danger"
      />
    </div>
  );
}
