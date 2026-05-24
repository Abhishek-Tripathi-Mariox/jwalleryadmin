import { useState, useEffect, useCallback } from "react";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Pagination } from "../../components/ui/Pagination";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { reelService, type Reel } from "../../services/reelService";
import { useToast } from "../../store/toastStore";
import { Plus, Edit, Trash2, Power, ExternalLink } from "lucide-react";

function isVideo(url: string) {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

function MediaPreview({ src, className }: { src: string; className?: string }) {
  if (!src) return null;
  if (isVideo(src)) {
    return <video src={src} className={className} muted loop playsInline />;
  }
  return <img src={src} alt="reel" className={className} />;
}

export function ReelsPage() {
  const toast = useToast();
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const [modalOpen, setModalOpen] = useState(false);
  const [editReel, setEditReel] = useState<Reel | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [rank, setRank] = useState("0");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const fetchReels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reelService.getReels(page, limit);
      if (res.code === 1 && res.data) {
        setReels(res.data.reels || []);
        setTotal(res.data.total || 0);
      }
    } catch {
      toast.error("Failed to load reels");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchReels();
  }, [fetchReels]);

  const openCreateModal = () => {
    setEditReel(null);
    setTitle("");
    setInstagramUrl("");
    setRank("0");
    setMediaFile(null);
    setThumbnailFile(null);
    setModalOpen(true);
  };

  const openEditModal = (reel: Reel) => {
    setEditReel(reel);
    setTitle(reel.title || "");
    setInstagramUrl(reel.instagramUrl);
    setRank(String(reel.rank));
    setMediaFile(null);
    setThumbnailFile(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!instagramUrl.trim()) {
      toast.error("Instagram URL is required");
      return;
    }
    if (!editReel && !mediaFile) {
      toast.error("Media (image or video) is required");
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("instagramUrl", instagramUrl);
      formData.append("rank", rank);
      if (mediaFile) formData.append("media", mediaFile);
      if (thumbnailFile) formData.append("thumbnail", thumbnailFile);

      if (editReel) {
        await reelService.updateReel(editReel._id, formData);
        toast.success("Reel updated");
      } else {
        await reelService.createReel(formData);
        toast.success("Reel created");
      }
      setModalOpen(false);
      fetchReels();
    } catch {
      toast.error("Failed to save reel");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await reelService.deleteReel(deleteConfirm);
      toast.success("Reel deleted");
      setDeleteConfirm(null);
      fetchReels();
    } catch {
      toast.error("Failed to delete reel");
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await reelService.toggleStatus(id);
      fetchReels();
    } catch {
      toast.error("Failed to toggle status");
    }
  };

  const columns = [
    {
      key: "mediaUrl" as const,
      header: "Reel",
      render: (reel: Reel) => (
        <div className="flex items-center gap-3">
          <div className="h-16 w-10 overflow-hidden rounded-md bg-gray-100">
            <MediaPreview
              src={reel.mediaUrl}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {reel.title || "(no caption)"}
            </p>
            <p className="text-xs text-gray-500">
              Rank: {reel.rank} · {reel.mediaType}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "instagramUrl" as const,
      header: "Instagram Link",
      render: (reel: Reel) => (
        <a
          href={reel.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex max-w-xs items-center gap-1 truncate text-sm text-pink-600 hover:underline"
        >
          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{reel.instagramUrl}</span>
        </a>
      ),
    },
    {
      key: "isActive" as const,
      header: "Status",
      render: (reel: Reel) => (
        <Badge variant={reel.isActive ? "success" : "danger"}>
          {reel.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "_id" as const,
      header: "Actions",
      render: (reel: Reel) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(reel._id)}>
            <Power className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => openEditModal(reel)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(reel._id)}>
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
          <h1 className="text-2xl font-bold text-gray-900">Instagram Reels</h1>
          <p className="text-sm text-gray-500">
            Reels shown in the "Instagram Reels" section on the website home page
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" /> Add Reel
        </Button>
      </div>

      <Table data={reels} columns={columns} />

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
        title={editReel ? "Edit Reel" : "Add Reel"}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Media — image or video{editReel ? "" : " *"}
            </label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
              className="block w-full text-sm"
            />
            {editReel?.mediaUrl && !mediaFile && (
              <div className="mt-2 h-32 w-20 overflow-hidden rounded-md bg-gray-100">
                <MediaPreview
                  src={editReel.mediaUrl}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>

          <Input
            label="Instagram URL *"
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            placeholder="https://www.instagram.com/reel/..."
          />

          <Input
            label="Caption (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Bridal collection"
          />

          <Input
            label="Rank (display order)"
            type="number"
            value={rank}
            onChange={(e) => setRank(e.target.value)}
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Video thumbnail / poster (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
              className="block w-full text-sm"
            />
            {editReel?.thumbnailUrl && !thumbnailFile && (
              <img
                src={editReel.thumbnailUrl}
                alt="Current thumbnail"
                className="mt-2 h-20 w-20 rounded-md object-cover"
              />
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} isLoading={saving}>
              {editReel ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Reel"
        message="Are you sure you want to delete this reel? This action cannot be undone."
        variant="danger"
      />
    </div>
  );
}
