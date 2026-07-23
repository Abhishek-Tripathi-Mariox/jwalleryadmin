import { useState, useEffect, useCallback } from "react";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { storeService, type Store, type StoreForm } from "../../services/storeService";
import { LocationPicker, type LocationPatch } from "./LocationPicker";
import { useToast } from "../../store/toastStore";
import { Plus, Edit, Trash2, Power, Store as StoreIcon } from "lucide-react";

const emptyForm: StoreForm = {
  name: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  phone: "",
  whatsapp: "",
  workingHours: "",
  latitude: "",
  longitude: "",
  rank: "0",
};

export function StoresPage() {
  const toast = useToast();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editStore, setEditStore] = useState<Store | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<StoreForm>(emptyForm);
  const setField = (key: keyof StoreForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));
  const applyLocationPatch = (patch: LocationPatch) =>
    setForm((f) => ({ ...f, ...patch }));

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const res = await storeService.getStores();
      if (res.code === 1 && res.data) setStores(res.data.stores || []);
    } catch {
      toast.error("Failed to load stores");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const openCreate = () => {
    setEditStore(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (s: Store) => {
    setEditStore(s);
    setForm({
      name: s.name,
      address: s.address,
      city: s.city || "",
      state: s.state || "",
      pincode: s.pincode || "",
      phone: s.phone || "",
      whatsapp: s.whatsapp || "",
      workingHours: s.workingHours || "",
      latitude: s.latitude !== undefined ? String(s.latitude) : "",
      longitude: s.longitude !== undefined ? String(s.longitude) : "",
      rank: String(s.rank ?? 0),
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error("Store name is required");
    if (!form.address.trim()) return toast.error("Address is required");
    setSaving(true);
    try {
      if (editStore) {
        await storeService.updateStore(editStore._id, form);
        toast.success("Store updated");
      } else {
        await storeService.createStore(form);
        toast.success("Store created");
      }
      setModalOpen(false);
      fetchStores();
    } catch {
      toast.error("Failed to save store");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await storeService.deleteStore(deleteConfirm);
      toast.success("Store deleted");
      setDeleteConfirm(null);
      fetchStores();
    } catch {
      toast.error("Failed to delete store");
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await storeService.toggleStatus(id);
      fetchStores();
    } catch {
      toast.error("Failed to toggle status");
    }
  };

  const columns = [
    {
      key: "name" as const,
      header: "Store",
      render: (s: Store) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100">
            <StoreIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{s.name}</p>
            <p className="text-xs text-gray-500">Rank: {s.rank}</p>
          </div>
        </div>
      ),
    },
    {
      key: "address" as const,
      header: "Address",
      render: (s: Store) => (
        <span className="text-sm text-gray-700">
          {[s.address, s.city, s.state, s.pincode].filter(Boolean).join(", ")}
        </span>
      ),
    },
    {
      key: "phone" as const,
      header: "Contact",
      render: (s: Store) => (
        <div className="text-sm text-gray-700">
          {s.phone && <p>{s.phone}</p>}
          {s.workingHours && <p className="text-xs text-gray-500">{s.workingHours}</p>}
        </div>
      ),
    },
    {
      key: "isActive" as const,
      header: "Status",
      render: (s: Store) => (
        <Badge variant={s.isActive ? "success" : "danger"}>
          {s.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "_id" as const,
      header: "Actions",
      render: (s: Store) => (
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
          <h1 className="text-2xl font-bold text-gray-900">Store Locator</h1>
          <p className="text-sm text-gray-500">
            Manage physical store locations shown on the app and website
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add Store
        </Button>
      </div>

      <Table data={stores} columns={columns} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editStore ? "Edit Store" : "Add Store"}>
        <div className="space-y-4">
          <Input label="Store Name" value={form.name} onChange={setField("name")} placeholder="e.g. Swarnaz Jewellery — Patna" />

          <LocationPicker
            latitude={form.latitude}
            longitude={form.longitude}
            onChange={applyLocationPatch}
          />

          <Input label="Address" value={form.address} onChange={setField("address")} placeholder="Shop No., Street, Landmark" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="City" value={form.city} onChange={setField("city")} />
            <Input label="State" value={form.state} onChange={setField("state")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Pincode" value={form.pincode} onChange={setField("pincode")} />
            <Input label="Working Hours" value={form.workingHours} onChange={setField("workingHours")} placeholder="11:00 AM - 8:00 PM" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone" value={form.phone} onChange={setField("phone")} placeholder="+91 9xxxxxxxxx" />
            <Input label="WhatsApp (optional)" value={form.whatsapp} onChange={setField("whatsapp")} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Latitude" value={form.latitude} placeholder="Set via map above" readOnly disabled />
            <Input label="Longitude" value={form.longitude} placeholder="Set via map above" readOnly disabled />
            <Input label="Rank (display order)" type="number" value={form.rank} onChange={setField("rank")} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} isLoading={saving}>{editStore ? "Update" : "Create"}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Store"
        message="Are you sure you want to delete this store location?"
        variant="danger"
      />
    </div>
  );
}
