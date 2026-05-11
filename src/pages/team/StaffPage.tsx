import { useState, useEffect, useCallback } from "react";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { staffService, type Staff, type StaffForm } from "../../services/staffService";
import { roleService, type Role } from "../../services/roleService";
import { useToast } from "../../store/toastStore";
import { Plus, Edit, Trash2, Power, UserCog } from "lucide-react";

const emptyForm: StaffForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  role: "admin",
  roleId: "",
};

export function StaffPage() {
  const toast = useToast();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editStaff, setEditStaff] = useState<Staff | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<StaffForm>({ ...emptyForm });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [staffRes, rolesRes] = await Promise.all([
        staffService.getAll(),
        roleService.getAll(),
      ]);
      if (staffRes.data) setStaff(Array.isArray(staffRes.data) ? staffRes.data : []);
      if (rolesRes.data) setRoles(Array.isArray(rolesRes.data) ? rolesRes.data : []);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreateModal = () => {
    setEditStaff(null);
    setForm({ ...emptyForm });
    setModalOpen(true);
  };

  const openEditModal = (member: Staff) => {
    setEditStaff(member);
    setForm({
      name: member.name,
      email: member.email,
      phone: member.phone || "",
      role: member.role,
      roleId: member.roleId?._id || "",
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    if (!editStaff && !form.password) {
      toast.error("Password is required for new staff");
      return;
    }
    setSaving(true);
    try {
      const payload: Partial<StaffForm> = { ...form };
      if (editStaff && !payload.password) delete payload.password;
      if (!payload.roleId) delete payload.roleId;

      if (editStaff) {
        await staffService.update(editStaff._id, payload);
        toast.success("Staff updated");
      } else {
        await staffService.create(form);
        toast.success("Staff created");
      }
      setModalOpen(false);
      fetchData();
    } catch {
      toast.error("Failed to save staff");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await staffService.delete(deleteConfirm);
      toast.success("Staff deleted");
      setDeleteConfirm(null);
      fetchData();
    } catch {
      toast.error("Failed to delete staff");
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await staffService.toggleStatus(id);
      fetchData();
    } catch {
      toast.error("Failed to toggle status");
    }
  };

  const activeRoles = roles.filter((r) => r.isActive);

  const columns = [
    {
      key: "name" as const,
      header: "Staff Member",
      render: (member: Staff) => (
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-[#B8860B]/10 flex items-center justify-center">
              <UserCog className="w-4 h-4 text-[#B8860B]" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{member.name}</p>
              <p className="text-xs text-gray-500">{member.email}</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "role" as const,
      header: "Role",
      render: (member: Staff) => (
        <div>
          <Badge variant={member.role === "superadmin" ? "warning" : "info"}>
            {member.role}
          </Badge>
          {member.roleId && (
            <p className="text-xs text-gray-500 mt-1">{member.roleId.name}</p>
          )}
        </div>
      ),
    },
    {
      key: "lastLogin" as const,
      header: "Last Login",
      render: (member: Staff) => (
        <span className="text-sm text-gray-600">
          {member.lastLogin
            ? new Date(member.lastLogin).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Never"}
        </span>
      ),
    },
    {
      key: "isActive" as const,
      header: "Status",
      render: (member: Staff) => (
        <Badge variant={member.isActive ? "success" : "danger"}>
          {member.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "_id" as const,
      header: "Actions",
      render: (member: Staff) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleStatus(member._id)}
          >
            <Power className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => openEditModal(member)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteConfirm(member._id)}
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
          <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
          <p className="text-sm text-gray-500">
            Manage staff members and their access levels
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" /> Add Staff
        </Button>
      </div>

      <Table data={staff} columns={columns} />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editStaff ? "Edit Staff" : "Add Staff"}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="John Doe"
              required
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="john@example.com"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone"
              value={form.phone || ""}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+91 9876543210"
            />
            <Input
              label={editStaff ? "New Password (leave blank to keep)" : "Password"}
              type="password"
              value={form.password || ""}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={editStaff ? "Leave blank to keep current" : "Min 6 characters"}
              required={!editStaff}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Account Type"
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value as "admin" | "superadmin" })
              }
              options={[
                { value: "admin", label: "Admin" },
                { value: "superadmin", label: "Super Admin" },
              ]}
            />
            <Select
              label="Permission Role"
              value={form.roleId || ""}
              onChange={(e) => setForm({ ...form, roleId: e.target.value })}
              options={[
                { value: "", label: "No role (full access for superadmin)" },
                ...activeRoles.map((r) => ({ value: r._id, label: r.name })),
              ]}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} isLoading={saving}>
              {editStaff ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Staff"
        message="Are you sure you want to delete this staff member? This action cannot be undone."
        variant="danger"
      />
    </div>
  );
}
