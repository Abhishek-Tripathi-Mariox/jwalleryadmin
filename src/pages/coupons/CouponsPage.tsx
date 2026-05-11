import { useState, useEffect, useCallback } from "react";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Pagination } from "../../components/ui/Pagination";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { couponService, type Coupon } from "../../services/couponService";
import { useToast } from "../../store/toastStore";
import { formatCurrency } from "../../lib/utils";
import { Plus, Edit, Trash2, Power, Search, Tag } from "lucide-react";

export function CouponsPage() {
  const toast = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const limit = 10;

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editCoupon, setEditCoupon] = useState<Coupon | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [maxDiscountAmount, setMaxDiscountAmount] = useState("");
  const [minOrderValue, setMinOrderValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [applicableFor, setApplicableFor] = useState("all");
  const [paymentMode, setPaymentMode] = useState("both");

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await couponService.getCoupons(page, limit, search);
      if (res.code === 1 && res.data) {
        setCoupons(res.data.coupons || []);
        setTotal(res.data.total || 0);
      }
    } catch {
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const resetForm = () => {
    setCode("");
    setTitle("");
    setDescription("");
    setDiscountType("percentage");
    setDiscountValue("");
    setMaxDiscountAmount("");
    setMinOrderValue("");
    setStartDate("");
    setEndDate("");
    setApplicableFor("all");
    setPaymentMode("both");
  };

  const openCreateModal = () => {
    setEditCoupon(null);
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditCoupon(coupon);
    setCode(coupon.code);
    setTitle(coupon.title || "");
    setDescription(coupon.description || "");
    setDiscountType(coupon.discountType);
    setDiscountValue(String(coupon.discountValue));
    setMaxDiscountAmount(coupon.maxDiscountAmount ? String(coupon.maxDiscountAmount) : "");
    setMinOrderValue(coupon.minOrderValue ? String(coupon.minOrderValue) : "");
    setStartDate(coupon.startDate ? coupon.startDate.split("T")[0] : "");
    setEndDate(coupon.endDate ? coupon.endDate.split("T")[0] : "");
    setApplicableFor(coupon.applicableFor || "all");
    setPaymentMode(coupon.paymentMode || "both");
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!code.trim() || !discountValue) {
      toast.error("Code and discount value are required");
      return;
    }
    setSaving(true);
    try {
      const data: Record<string, unknown> = {
        code,
        title,
        description,
        discountType,
        discountValue: Number(discountValue),
        applicableFor,
        paymentMode,
      };
      if (maxDiscountAmount) data.maxDiscountAmount = Number(maxDiscountAmount);
      if (minOrderValue) data.minOrderValue = Number(minOrderValue);
      if (startDate) data.startDate = startDate;
      if (endDate) data.endDate = endDate;

      if (editCoupon) {
        await couponService.updateCoupon(editCoupon._id, data);
        toast.success("Coupon updated");
      } else {
        await couponService.createCoupon(data);
        toast.success("Coupon created");
      }
      setModalOpen(false);
      fetchCoupons();
    } catch {
      toast.error("Failed to save coupon");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await couponService.deleteCoupon(deleteConfirm);
      toast.success("Coupon deleted");
      setDeleteConfirm(null);
      fetchCoupons();
    } catch {
      toast.error("Failed to delete coupon");
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await couponService.toggleStatus(id);
      fetchCoupons();
    } catch {
      toast.error("Failed to toggle status");
    }
  };

  const columns = [
    {
      key: "code" as const,
      header: "Coupon",
      render: (coupon: Coupon) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
            <Tag className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="font-mono font-bold text-gray-900">{coupon.code}</p>
            <p className="text-xs text-gray-500">{coupon.title}</p>
          </div>
        </div>
      ),
    },
    {
      key: "discountType" as const,
      header: "Discount",
      render: (coupon: Coupon) => (
        <div>
          <p className="font-medium">
            {coupon.discountType === "percentage"
              ? `${coupon.discountValue}%`
              : formatCurrency(coupon.discountValue)}
          </p>
          {coupon.maxDiscountAmount && coupon.discountType === "percentage" && (
            <p className="text-xs text-gray-500">
              Max: {formatCurrency(coupon.maxDiscountAmount)}
            </p>
          )}
          {coupon.minOrderValue > 0 && (
            <p className="text-xs text-gray-500">
              Min order: {formatCurrency(coupon.minOrderValue)}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "startDate" as const,
      header: "Validity",
      render: (coupon: Coupon) => (
        <div className="text-sm">
          {coupon.startDate
            ? new Date(coupon.startDate).toLocaleDateString()
            : "—"}
          {" to "}
          {coupon.endDate
            ? new Date(coupon.endDate).toLocaleDateString()
            : "—"}
        </div>
      ),
    },
    {
      key: "applicableFor" as const,
      header: "For",
      render: (coupon: Coupon) => (
        <Badge
          variant={
            coupon.applicableFor === "all"
              ? "primary"
              : coupon.applicableFor === "newUser"
              ? "warning"
              : "info"
          }
        >
          {coupon.applicableFor === "all"
            ? "All Users"
            : coupon.applicableFor === "newUser"
            ? "New Users"
            : "Specific"}
        </Badge>
      ),
    },
    {
      key: "isActive" as const,
      header: "Status",
      render: (coupon: Coupon) => (
        <Badge variant={coupon.isActive ? "success" : "danger"}>
          {coupon.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "_id" as const,
      header: "Actions",
      render: (coupon: Coupon) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleStatus(coupon._id)}
          >
            <Power className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEditModal(coupon)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteConfirm(coupon._id)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  if (loading && coupons.length === 0) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons & Offers</h1>
          <p className="text-sm text-gray-500">
            Manage discount coupons and promotional offers
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" /> Add Coupon
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Search coupons..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          leftIcon={<Search className="h-4 w-4" />}
        />
      </div>

      <Table data={coupons} columns={columns} />

      {total > limit && (
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(total / limit)}
          onPageChange={setPage}
        />
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editCoupon ? "Edit Coupon" : "Create Coupon"}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Coupon Code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. WELCOME50"
            />
            <Input
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Coupon title"
            />
          </div>
          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description"
          />
          <div className="grid grid-cols-3 gap-4">
            <Select
              label="Discount Type"
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
              options={[
                { value: "percentage", label: "Percentage" },
                { value: "fixed", label: "Fixed Amount" },
              ]}
            />
            <Input
              label={discountType === "percentage" ? "Discount %" : "Discount ₹"}
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
            />
            {discountType === "percentage" && (
              <Input
                label="Max Discount ₹"
                type="number"
                value={maxDiscountAmount}
                onChange={(e) => setMaxDiscountAmount(e.target.value)}
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Min Order Value ₹"
              type="number"
              value={minOrderValue}
              onChange={(e) => setMinOrderValue(e.target.value)}
            />
            <Select
              label="Applicable For"
              value={applicableFor}
              onChange={(e) => setApplicableFor(e.target.value)}
              options={[
                { value: "all", label: "All Users" },
                { value: "newUser", label: "New Users Only" },
                { value: "specificUser", label: "Specific User" },
              ]}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <Select
              label="Payment Mode"
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              options={[
                { value: "both", label: "Both" },
                { value: "online", label: "Online Only" },
                { value: "cod", label: "COD Only" },
              ]}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} isLoading={saving}>
              {editCoupon ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Coupon"
        message="Are you sure you want to delete this coupon? This action cannot be undone."
        variant="danger"
      />
    </div>
  );
}
