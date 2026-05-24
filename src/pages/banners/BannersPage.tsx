import { useState, useEffect, useCallback } from "react";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Pagination } from "../../components/ui/Pagination";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { bannerService, type Banner } from "../../services/bannerService";
import { useToast } from "../../store/toastStore";
import {
  Plus,
  Edit,
  Trash2,
  Power,
  Image as ImageIcon,
} from "lucide-react";

function isVideo(url: string) {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

/**
 * Effective banner status as it behaves on the storefront. The expire date is
 * optional and does NOT hide a banner once it passes — only the Inactive flag
 * (or a future start date) keeps a banner off the site. This mirrors the
 * website's getActiveBanners() rule so admins see the real outcome.
 */
function bannerStatus(banner: Banner): {
  label: string;
  variant: "success" | "warning" | "danger";
} {
  if (!banner.isActive) return { label: "Inactive", variant: "danger" };
  const now = Date.now();
  if (banner.startDate && new Date(banner.startDate).getTime() > now) {
    return { label: "Scheduled", variant: "warning" };
  }
  return { label: "Active", variant: "success" };
}

function MediaPreview({ src, alt, className }: { src: string; alt: string; className?: string }) {
  if (isVideo(src)) {
    return <video src={src} className={className} muted loop playsInline />;
  }
  return <img src={src} alt={alt} className={className} />;
}

export function BannersPage() {
  const toast = useToast();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editBanner, setEditBanner] = useState<Banner | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [section, setSection] = useState("home_offers");
  const [link, setLink] = useState("");
  const [rank, setRank] = useState("0");
  const [startDate, setStartDate] = useState("");
  const [expireDate, setExpireDate] = useState("");
  const [mobileFile, setMobileFile] = useState<File | null>(null);
  const [ipadFile, setIpadFile] = useState<File | null>(null);
  const [desktopFile, setDesktopFile] = useState<File | null>(null);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bannerService.getBanners(page, limit);
      if (res.code === 1 && res.data) {
        setBanners(res.data.banners || []);
        setTotal(res.data.total || 0);
      }
    } catch {
      toast.error("Failed to load banners");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const openCreateModal = () => {
    setEditBanner(null);
    setTitle("");
    setSubtitle("");
    setSection("home_offers");
    setLink("");
    setRank("0");
    setStartDate("");
    setExpireDate("");
    setMobileFile(null);
    setIpadFile(null);
    setDesktopFile(null);
    setModalOpen(true);
  };

  const openEditModal = (banner: Banner) => {
    setEditBanner(banner);
    setTitle(banner.title);
    setSubtitle((banner as any).subtitle || "");
    setSection((banner as any).section || "home_offers");
    setLink((banner as any).link || "");
    setRank(String(banner.rank));
    setStartDate(banner.startDate ? banner.startDate.split("T")[0] : "");
    setExpireDate(banner.expireDate ? banner.expireDate.split("T")[0] : "");
    setMobileFile(null);
    setIpadFile(null);
    setDesktopFile(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("subtitle", subtitle);
      formData.append("section", section);
      formData.append("link", link);
      formData.append("rank", rank);
      if (startDate) formData.append("startDate", startDate);
      if (expireDate) formData.append("expireDate", expireDate);
      if (mobileFile) formData.append("mobileView", mobileFile);
      if (ipadFile) formData.append("ipadView", ipadFile);
      if (desktopFile) formData.append("desktopView", desktopFile);

      if (editBanner) {
        await bannerService.updateBanner(editBanner._id, formData);
        toast.success("Banner updated");
      } else {
        await bannerService.createBanner(formData);
        toast.success("Banner created");
      }
      setModalOpen(false);
      fetchBanners();
    } catch {
      toast.error("Failed to save banner");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await bannerService.deleteBanner(deleteConfirm);
      toast.success("Banner deleted");
      setDeleteConfirm(null);
      fetchBanners();
    } catch {
      toast.error("Failed to delete banner");
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await bannerService.toggleStatus(id);
      fetchBanners();
    } catch {
      toast.error("Failed to toggle status");
    }
  };

  const columns = [
    {
      key: "title" as const,
      header: "Banner",
      render: (banner: Banner) => (
        <div className="flex items-center gap-3">
          {banner.mobileView ? (
            <MediaPreview
              src={banner.mobileView}
              alt={banner.title}
              className="h-12 w-20 rounded object-cover"
            />
          ) : (
            <div className="flex h-12 w-20 items-center justify-center rounded bg-gray-100">
              <ImageIcon className="h-5 w-5 text-gray-400" />
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">{banner.title}</p>
            <p className="text-xs text-gray-500">Rank: {banner.rank}</p>
          </div>
        </div>
      ),
    },
    {
      key: "startDate" as const,
      header: "Period",
      render: (banner: Banner) => (
        <div className="text-sm">
          {banner.startDate
            ? new Date(banner.startDate).toLocaleDateString()
            : "No start"}
          {" - "}
          {banner.expireDate
            ? new Date(banner.expireDate).toLocaleDateString()
            : "No end"}
        </div>
      ),
    },
    {
      key: "isActive" as const,
      header: "Status",
      render: (banner: Banner) => {
        const status = bannerStatus(banner);
        return <Badge variant={status.variant}>{status.label}</Badge>;
      },
    },
    {
      key: "_id" as const,
      header: "Actions",
      render: (banner: Banner) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleStatus(banner._id)}
          >
            <Power className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEditModal(banner)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteConfirm(banner._id)}
          >
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
          <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
          <p className="text-sm text-gray-500">
            Manage promotional banners for the mobile app
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" /> Add Banner
        </Button>
      </div>

      <Table data={banners} columns={columns} />

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
        title={editBanner ? "Edit Banner" : "Add Banner"}
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Flat 5% OFF on Gold"
          />
          <Input
            label="Subtitle / Tag"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="e.g. Limited Time Offer"
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Section
            </label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B8860B]"
            >
              <option value="home_offers">Home — Offers (two-card row)</option>
              <option value="home_hero">Home — Hero (top banner)</option>
              <option value="home_sundar_keel">Home — Sundar Keel</option>
              <option value="home_bridal">Home — Bridal feature</option>
              <option value="home_temple">Home — Temple feature</option>
              <option value="home_cta">Home — Bottom CTA</option>
              <option value="match_tiles">Home — Perfect Match tiles</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Controls which slot on the home page this banner fills.
            </p>
          </div>
          <Input
            label="Link / CTA target (optional)"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="/category/gold  or  https://..."
          />
          <Input
            label="Rank (display order)"
            type="number"
            value={rank}
            onChange={(e) => setRank(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              label="Expire Date"
              type="date"
              value={expireDate}
              onChange={(e) => setExpireDate(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Mobile Image/Video
            </label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setMobileFile(e.target.files?.[0] || null)}
              className="block w-full text-sm"
            />
            {editBanner?.mobileView && !mobileFile && (
              <MediaPreview
                src={editBanner.mobileView}
                alt="Current"
                className="mt-2 h-16 rounded"
              />
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              iPad Image/Video
            </label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setIpadFile(e.target.files?.[0] || null)}
              className="block w-full text-sm"
            />
            {editBanner?.ipadView && !ipadFile && (
              <MediaPreview
                src={editBanner.ipadView}
                alt="Current"
                className="mt-2 h-16 rounded"
              />
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Desktop Image/Video
            </label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setDesktopFile(e.target.files?.[0] || null)}
              className="block w-full text-sm"
            />
            {editBanner?.desktopView && !desktopFile && (
              <MediaPreview
                src={editBanner.desktopView}
                alt="Current"
                className="mt-2 h-16 rounded"
              />
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} isLoading={saving}>
              {editBanner ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Banner"
        message="Are you sure you want to delete this banner? This action cannot be undone."
        variant="danger"
      />
    </div>
  );
}
