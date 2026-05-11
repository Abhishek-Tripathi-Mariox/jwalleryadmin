import { useState, useEffect, useCallback } from "react";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import {
  roleService,
  MODULES,
  type Role,
  type RoleForm,
  type Permission,
} from "../../services/roleService";
import { useToast } from "../../store/toastStore";
import { Plus, Edit, Trash2, Power, Shield } from "lucide-react";

const GROUPS = [...new Set(MODULES.map((m) => m.group))];

const emptyForm: RoleForm = {
  name: "",
  description: "",
  permissions: MODULES.map((m) => ({
    module: m.key,
    create: false,
    read: false,
    update: false,
    delete: false,
  })),
};

export function RolesPage() {
  const toast = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<RoleForm>({ ...emptyForm });

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await roleService.getAll();
      if (res.data) setRoles(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Failed to load roles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const openCreateModal = () => {
    setEditRole(null);
    setForm({
      ...emptyForm,
      permissions: MODULES.map((m) => ({
        module: m.key,
        create: false,
        read: false,
        update: false,
        delete: false,
      })),
    });
    setModalOpen(true);
  };

  const openEditModal = (role: Role) => {
    setEditRole(role);
    const permMap = new Map(role.permissions.map((p) => [p.module, p]));
    setForm({
      name: role.name,
      description: role.description,
      permissions: MODULES.map((m) => {
        const existing = permMap.get(m.key);
        return existing
          ? { ...existing }
          : { module: m.key, create: false, read: false, update: false, delete: false };
      }),
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Role name is required");
      return;
    }
    setSaving(true);
    try {
      if (editRole) {
        await roleService.update(editRole._id, form);
        toast.success("Role updated");
      } else {
        await roleService.create(form);
        toast.success("Role created");
      }
      setModalOpen(false);
      fetchRoles();
    } catch {
      toast.error("Failed to save role");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await roleService.delete(deleteConfirm);
      toast.success("Role deleted");
      setDeleteConfirm(null);
      fetchRoles();
    } catch {
      toast.error("Failed to delete role");
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await roleService.toggleStatus(id);
      fetchRoles();
    } catch {
      toast.error("Failed to toggle status");
    }
  };

  const togglePermission = (module: string, action: keyof Omit<Permission, "module">) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.map((p) =>
        p.module === module ? { ...p, [action]: !p[action] } : p
      ),
    }));
  };

  const toggleAllForModule = (module: string, checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.map((p) =>
        p.module === module
          ? { ...p, create: checked, read: checked, update: checked, delete: checked }
          : p
      ),
    }));
  };

  const toggleAllForAction = (action: keyof Omit<Permission, "module">, checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.map((p) => ({ ...p, [action]: checked })),
    }));
  };

  const isAllCheckedForModule = (module: string) => {
    const p = form.permissions.find((p) => p.module === module);
    return p ? p.create && p.read && p.update && p.delete : false;
  };

  const isAllCheckedForAction = (action: keyof Omit<Permission, "module">) => {
    return form.permissions.every((p) => p[action]);
  };

  const getPermissionSummary = (role: Role) => {
    const total = role.permissions.length;
    const active = role.permissions.filter(
      (p) => p.create || p.read || p.update || p.delete
    ).length;
    return `${active}/${total} modules`;
  };

  const columns = [
    {
      key: "name" as const,
      header: "Role",
      render: (role: Role) => (
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#B8860B]" />
            <p className="font-medium text-gray-900">{role.name}</p>
            {role.isSystem && (
              <Badge variant="warning">System</Badge>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1 ml-6">{role.description}</p>
        </div>
      ),
    },
    {
      key: "permissions" as const,
      header: "Permissions",
      render: (role: Role) => (
        <span className="text-sm text-gray-600">{getPermissionSummary(role)}</span>
      ),
    },
    {
      key: "isActive" as const,
      header: "Status",
      render: (role: Role) => (
        <Badge variant={role.isActive ? "success" : "danger"}>
          {role.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "_id" as const,
      header: "Actions",
      render: (role: Role) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleStatus(role._id)}
            disabled={role.isSystem}
          >
            <Power className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => openEditModal(role)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteConfirm(role._id)}
            disabled={role.isSystem}
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
          <h1 className="text-2xl font-bold text-gray-900">Roles</h1>
          <p className="text-sm text-gray-500">
            Manage roles and permissions for staff members
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" /> Add Role
        </Button>
      </div>

      <Table data={roles} columns={columns} />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editRole ? "Edit Role" : "Create Role"}
        size="2xl"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Role Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Content Manager"
              required
              disabled={editRole?.isSystem}
            />
            <Input
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description"
            />
          </div>

          {/* Permissions Grid */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Module Permissions
            </h4>
            <div className="border rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-700">
                      Module
                    </th>
                    <th className="text-center px-2 py-2.5 font-medium text-gray-700">
                      <label className="flex flex-col items-center gap-0.5 cursor-pointer">
                        <span>All</span>
                      </label>
                    </th>
                    {(["create", "read", "update", "delete"] as const).map((action) => (
                      <th key={action} className="text-center px-2 py-2.5 font-medium text-gray-700">
                        <label className="flex flex-col items-center gap-0.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isAllCheckedForAction(action)}
                            onChange={(e) => toggleAllForAction(action, e.target.checked)}
                            className="w-3.5 h-3.5 rounded border-gray-300 text-[#B8860B] focus:ring-[#B8860B]"
                          />
                          <span className="capitalize">{action}</span>
                        </label>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {GROUPS.map((group) => (
                    <>
                      <tr key={`group-${group}`}>
                        <td
                          colSpan={6}
                          className="px-4 py-2 bg-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                        >
                          {group}
                        </td>
                      </tr>
                      {MODULES.filter((m) => m.group === group).map((mod) => {
                        const perm = form.permissions.find((p) => p.module === mod.key);
                        if (!perm) return null;
                        return (
                          <tr
                            key={mod.key}
                            className="border-t border-gray-100 hover:bg-gray-50"
                          >
                            <td className="px-4 py-2 text-gray-800">{mod.label}</td>
                            <td className="text-center px-2 py-2">
                              <input
                                type="checkbox"
                                checked={isAllCheckedForModule(mod.key)}
                                onChange={(e) =>
                                  toggleAllForModule(mod.key, e.target.checked)
                                }
                                className="w-3.5 h-3.5 rounded border-gray-300 text-[#B8860B] focus:ring-[#B8860B]"
                              />
                            </td>
                            {(["create", "read", "update", "delete"] as const).map(
                              (action) => (
                                <td key={action} className="text-center px-2 py-2">
                                  <input
                                    type="checkbox"
                                    checked={perm[action]}
                                    onChange={() => togglePermission(mod.key, action)}
                                    className="w-3.5 h-3.5 rounded border-gray-300 text-[#B8860B] focus:ring-[#B8860B]"
                                  />
                                </td>
                              )
                            )}
                          </tr>
                        );
                      })}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} isLoading={saving}>
              {editRole ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Role"
        message="Are you sure you want to delete this role? Staff members assigned to this role will lose their permissions."
        variant="danger"
      />
    </div>
  );
}
