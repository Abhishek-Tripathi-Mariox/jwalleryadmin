import { useState, useEffect, useCallback } from "react";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Pagination } from "../../components/ui/Pagination";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import {
  customerReviewService,
  type CustomerReview,
} from "../../services/customerReviewService";
import { useToast } from "../../store/toastStore";
import { Plus, Edit, Trash2, Power, User as UserIcon } from "lucide-react";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-yellow-500" title={`${rating} / 5`}>
      {"★".repeat(rating)}
      <span className="text-gray-300">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export function CustomerReviewsPage() {
  const toast = useToast();
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const [modalOpen, setModalOpen] = useState(false);
  const [editReview, setEditReview] = useState<CustomerReview | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [rating, setRating] = useState("5");
  const [reviewText, setReviewText] = useState("");
  const [rank, setRank] = useState("0");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await customerReviewService.getReviews(page, limit);
      if (res.code === 1 && res.data) {
        setReviews(res.data.reviews || []);
        setTotal(res.data.total || 0);
      }
    } catch {
      toast.error("Failed to load customer reviews");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const openCreateModal = () => {
    setEditReview(null);
    setName("");
    setRating("5");
    setReviewText("");
    setRank("0");
    setAvatarFile(null);
    setModalOpen(true);
  };

  const openEditModal = (review: CustomerReview) => {
    setEditReview(review);
    setName(review.name);
    setRating(String(review.rating || 5));
    setReviewText(review.reviewText);
    setRank(String(review.rank));
    setAvatarFile(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!reviewText.trim()) {
      toast.error("Review text is required");
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("rating", rating);
      formData.append("reviewText", reviewText);
      formData.append("rank", rank);
      if (avatarFile) formData.append("avatar", avatarFile);

      if (editReview) {
        await customerReviewService.updateReview(editReview._id, formData);
        toast.success("Review updated");
      } else {
        await customerReviewService.createReview(formData);
        toast.success("Review created");
      }
      setModalOpen(false);
      fetchReviews();
    } catch {
      toast.error("Failed to save review");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await customerReviewService.deleteReview(deleteConfirm);
      toast.success("Review deleted");
      setDeleteConfirm(null);
      fetchReviews();
    } catch {
      toast.error("Failed to delete review");
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await customerReviewService.toggleStatus(id);
      fetchReviews();
    } catch {
      toast.error("Failed to toggle status");
    }
  };

  const columns = [
    {
      key: "name" as const,
      header: "Customer",
      render: (review: CustomerReview) => (
        <div className="flex items-center gap-3">
          {review.avatar ? (
            <img
              src={review.avatar}
              alt={review.name}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
              <UserIcon className="h-5 w-5 text-gray-400" />
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">{review.name}</p>
            <p className="text-xs text-gray-500">Rank: {review.rank}</p>
          </div>
        </div>
      ),
    },
    {
      key: "rating" as const,
      header: "Rating",
      render: (review: CustomerReview) => <Stars rating={review.rating || 0} />,
    },
    {
      key: "reviewText" as const,
      header: "Review",
      render: (review: CustomerReview) => (
        <p className="max-w-md truncate text-sm text-gray-600">
          {review.reviewText}
        </p>
      ),
    },
    {
      key: "isActive" as const,
      header: "Status",
      render: (review: CustomerReview) => (
        <Badge variant={review.isActive ? "success" : "danger"}>
          {review.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "_id" as const,
      header: "Actions",
      render: (review: CustomerReview) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(review._id)}>
            <Power className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => openEditModal(review)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(review._id)}>
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
          <h1 className="text-2xl font-bold text-gray-900">Customer Reviews</h1>
          <p className="text-sm text-gray-500">
            Testimonials shown in the "Customer View" section on the website
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" /> Add Review
        </Button>
      </div>

      <Table data={reviews} columns={columns} />

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
        title={editReview ? "Edit Review" : "Add Review"}
      >
        <div className="space-y-4">
          <Input
            label="Customer Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Pratyush"
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Rating
            </label>
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B8860B]"
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {"★".repeat(n)} ({n})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Review Text
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
              placeholder="What the customer said..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B8860B]"
            />
          </div>
          <Input
            label="Rank (display order)"
            type="number"
            value={rank}
            onChange={(e) => setRank(e.target.value)}
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Customer Photo (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
              className="block w-full text-sm"
            />
            {editReview?.avatar && !avatarFile && (
              <img
                src={editReview.avatar}
                alt="Current"
                className="mt-2 h-16 w-16 rounded-full object-cover"
              />
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} isLoading={saving}>
              {editReview ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        variant="danger"
      />
    </div>
  );
}
