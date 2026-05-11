import React, { useEffect, useState } from "react";
import { Bell, Send, Loader2, Search, X } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useToast } from "../../store/toastStore";
import {
  notificationAdminService,
  type AdminNotification,
} from "../../services/notificationService";
import { userService } from "../../services/userService";
import type { User } from "../../types";

type Target = "broadcast" | "user";

export const NotificationsPage: React.FC = () => {
  const toast = useToast();

  const [target, setTarget] = useState<Target>("broadcast");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [type, setType] = useState<"system" | "promo" | "broadcast">("broadcast");
  const [sending, setSending] = useState(false);

  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searching, setSearching] = useState(false);

  const [items, setItems] = useState<AdminNotification[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => {
    fetchList();
  }, []);

  // Debounced user search
  useEffect(() => {
    if (target !== "user" || selectedUser) return;
    if (!userSearch.trim()) {
      setUserResults([]);
      return;
    }
    const id = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await userService.getUsers(1, 10, userSearch.trim());
        setUserResults(res.data?.users || []);
      } catch {
        setUserResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(id);
  }, [userSearch, target, selectedUser]);

  const fetchList = async () => {
    setLoadingList(true);
    try {
      const res = await notificationAdminService.list(1, 50);
      setItems(res.data?.items || []);
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setLoadingList(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setMessage("");
    setLink("");
    setSelectedUser(null);
    setUserSearch("");
  };

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Title and message are required");
      return;
    }
    if (target === "user" && !selectedUser) {
      toast.error("Please select a user");
      return;
    }
    setSending(true);
    try {
      await notificationAdminService.send({
        userId: target === "user" ? selectedUser!._id : null,
        title: title.trim(),
        message: message.trim(),
        link: link.trim() || undefined,
        type,
      });
      toast.success(
        target === "broadcast" ? "Broadcast sent to all users" : "Notification sent",
      );
      resetForm();
      await fetchList();
    } catch {
      toast.error("Failed to send notification");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-500 mt-1">
          Send notifications to all users or a specific user. Order events fire automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compose */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-[#B8860B]" />
            <h2 className="font-semibold text-gray-900">Compose</h2>
          </div>

          {/* Target */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Send to</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setTarget("broadcast");
                  setSelectedUser(null);
                  setType("broadcast");
                }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  target === "broadcast"
                    ? "bg-[#B8860B] text-white border-[#B8860B]"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                All users
              </button>
              <button
                type="button"
                onClick={() => {
                  setTarget("user");
                  setType("system");
                }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  target === "user"
                    ? "bg-[#B8860B] text-white border-[#B8860B]"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                Single user
              </button>
            </div>
          </div>

          {target === "user" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
              {selectedUser ? (
                <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">
                      {selectedUser.fullName || "Unnamed user"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {selectedUser.email || selectedUser.mobileNumber}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-400 hover:text-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Input
                    leftIcon={<Search className="w-4 h-4 text-gray-400" />}
                    placeholder="Search name, email or mobile…"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                  {userSearch && (
                    <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg bg-white shadow-sm">
                      {searching ? (
                        <div className="p-3 text-xs text-gray-500 flex items-center gap-2">
                          <Loader2 className="w-3 h-3 animate-spin" /> Searching…
                        </div>
                      ) : userResults.length === 0 ? (
                        <div className="p-3 text-xs text-gray-500">No users found</div>
                      ) : (
                        userResults.map((u) => (
                          <button
                            key={u._id}
                            type="button"
                            onClick={() => {
                              setSelectedUser(u);
                              setUserResults([]);
                              setUserSearch("");
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b last:border-0"
                          >
                            <div className="text-sm font-medium text-gray-900">
                              {u.fullName || "Unnamed user"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {u.email || u.mobileNumber}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Festive sale starts today"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Write the notification body…"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B8860B] focus:border-transparent"
            />
          </div>

          <Input
            label="Link (optional)"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="e.g. /category/offers"
            helperText="Relative path on the site or absolute URL"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B8860B] focus:border-transparent"
            >
              {target === "broadcast" && <option value="broadcast">Broadcast</option>}
              <option value="system">System</option>
              <option value="promo">Promo</option>
            </select>
          </div>

          <Button
            onClick={handleSend}
            isLoading={sending}
            leftIcon={<Send className="w-4 h-4" />}
            className="w-full"
          >
            Send notification
          </Button>
        </div>

        {/* History */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#B8860B]" />
              <h2 className="font-semibold text-gray-900">Recent</h2>
            </div>
            <span className="text-xs text-gray-500">{items.length} shown</span>
          </div>

          {loadingList ? (
            <div className="p-10 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-[#B8860B]" />
            </div>
          ) : items.length === 0 ? (
            <div className="p-10 text-center text-sm text-gray-500">
              No notifications yet.
            </div>
          ) : (
            <ul className="divide-y">
              {items.map((n) => (
                <li key={n._id} className="px-5 py-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {n.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {n.message}
                      </div>
                      <div className="text-xs text-gray-400 mt-1 flex flex-wrap gap-2">
                        <span className="px-1.5 py-0.5 bg-gray-100 rounded">
                          {n.type}
                        </span>
                        <span>
                          {n.userId
                            ? `→ ${n.userId.fullName || n.userId.email || "user"}`
                            : "→ all users"}
                        </span>
                        {n.link && <span className="text-amber-700">{n.link}</span>}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 whitespace-nowrap">
                      {new Date(n.createdAt).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "numeric",
                        minute: "numeric",
                      })}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
