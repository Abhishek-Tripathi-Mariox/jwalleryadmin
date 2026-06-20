import React, { useState, useEffect } from "react";
import {
  Search,
  Eye,
  ToggleLeft,
  ToggleRight,
  User,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Table } from "../../components/ui/Table";
import { Pagination } from "../../components/ui/Pagination";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { useToast } from "../../store/toastStore";
import { userService } from "../../services/userService";
import type { User as UserType } from "../../types";

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);

  // View user state
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const toast = useToast();

  useEffect(() => {
    fetchUsers();
  }, [page, search, statusFilter, cityFilter]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await userService.getUsers(page, limit, search, statusFilter, cityFilter);
      if (res.code === 1) {
        setUsers(res.data.users);
        setTotal(res.data.total);
      }
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (user: UserType) => {
    try {
      await userService.toggleStatus(user._id, !user.isActive);
      toast.success(
        `User ${user.isActive ? "deactivated" : "activated"} successfully!`,
      );
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleViewUser = (user: UserType) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const columns = [
    {
      key: "user",
      header: "User",
      render: (user: UserType) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#fdf8ec] rounded-full flex items-center justify-center">
            {user.profileImages ? (
              <img
                src={user.profileImages}
                alt={user.fullName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-[#B8860B]" />
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {user.fullName || "N/A"}
            </p>
            <p className="text-sm text-gray-500">{user.email || "No email"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "mobile",
      header: "Mobile",
      render: (user: UserType) => (
        <span>
          {user.countryCode} {user.mobileNumber}
        </span>
      ),
    },
    {
      key: "gender",
      header: "Gender",
      render: (user: UserType) => (
        <Badge variant="default">{user.gender || "N/A"}</Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (user: UserType) => (
        <Badge variant={user.isActive ? "success" : "danger"}>
          {user.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Joined",
      render: (user: UserType) => new Date(user.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      render: (user: UserType) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewUser(user);
            }}
            className="p-1 text-gray-500 hover:text-blue-600"
            title="View Details"
          >
            <Eye className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleStatus(user);
            }}
            className="p-1 text-gray-500 hover:text-[#B8860B]"
            title={user.isActive ? "Deactivate" : "Activate"}
          >
            {user.isActive ? (
              <ToggleRight className="w-5 h-5 text-green-600" />
            ) : (
              <ToggleLeft className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-500 mt-1">Manage your registered users</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by name, email, or mobile..."
              leftIcon={<Search className="w-5 h-5" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <Input
              placeholder="Filter by city..."
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              options={[
                { value: "", label: "All Status" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text="Loading users..." />
        </div>
      ) : (
        <>
          <Table columns={columns} data={users} emptyMessage="No users found" />
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(total / limit)}
            onPageChange={setPage}
            totalItems={total}
            itemsPerPage={limit}
          />
        </>
      )}

      {/* View User Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="User Details"
        size="md"
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-[#fdf8ec] rounded-full flex items-center justify-center">
                {selectedUser.profileImages ? (
                  <img
                    src={selectedUser.profileImages}
                    alt={selectedUser.fullName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-[#B8860B]" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedUser.fullName || "N/A"}
                </h3>
                <Badge variant={selectedUser.isActive ? "success" : "danger"}>
                  {selectedUser.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>

            {/* User Info */}
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium">
                    {selectedUser.email || "Not provided"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Mobile</p>
                  <p className="text-sm font-medium">
                    {selectedUser.countryCode} {selectedUser.mobileNumber}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Gender</p>
                  <p className="text-sm font-medium">
                    {selectedUser.gender || "Not specified"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Joined On</p>
                  <p className="text-sm font-medium">
                    {new Date(selectedUser.createdAt).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      },
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="ghost" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
              <Button
                variant={selectedUser.isActive ? "danger" : "primary"}
                onClick={() => {
                  handleToggleStatus(selectedUser);
                  setIsViewModalOpen(false);
                }}
              >
                {selectedUser.isActive ? "Deactivate User" : "Activate User"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
