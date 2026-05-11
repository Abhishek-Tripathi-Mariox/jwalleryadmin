import React, { useEffect, useState } from "react";
import { Loader2, Mail, Phone, Trash2, MessageSquare } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../store/toastStore";
import {
  contactSubmissionService,
  type ContactSubmission,
  type ContactSubmissionStatus,
} from "../../services/contactSubmissionService";

const STATUS_FILTERS: { key: "" | ContactSubmissionStatus; label: string }[] = [
  { key: "", label: "All" },
  { key: "new", label: "New" },
  { key: "in_progress", label: "In progress" },
  { key: "resolved", label: "Resolved" },
  { key: "spam", label: "Spam" },
];

const STATUS_OPTIONS: { v: ContactSubmissionStatus; l: string }[] = [
  { v: "new", l: "New" },
  { v: "in_progress", l: "In progress" },
  { v: "resolved", l: "Resolved" },
  { v: "spam", l: "Spam" },
];

const STATUS_COLOR: Record<ContactSubmissionStatus, string> = {
  new: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
  spam: "bg-red-100 text-red-800",
};

export const ContactSubmissionsPage: React.FC = () => {
  const toast = useToast();
  const [items, setItems] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"" | ContactSubmissionStatus>("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await contactSubmissionService.list(
        1,
        100,
        filter || undefined,
      );
      setItems(res.data?.items || []);
    } catch {
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleStatusChange = async (
    id: string,
    status: ContactSubmissionStatus,
  ) => {
    setUpdatingId(id);
    try {
      const res = await contactSubmissionService.update(id, { status });
      if (res?.code !== 1) {
        toast.error(res?.message || "Could not update");
        return;
      }
      setItems((arr) =>
        arr.map((it) => (it._id === id ? { ...it, status } : it)),
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this submission?")) return;
    const res = await contactSubmissionService.remove(id);
    if (res?.code !== 1) {
      toast.error(res?.message || "Could not delete");
      return;
    }
    toast.success("Deleted");
    setItems((arr) => arr.filter((it) => it._id !== id));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Contact Submissions</h1>
        <p className="text-gray-500 mt-1">
          Inbound enquiries from the website Contact Us form.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s.key || "all"}
            type="button"
            onClick={() => setFilter(s.key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filter === s.key
                ? "bg-[#B8860B] text-white border-[#B8860B]"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#B8860B]" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-10 text-center text-sm text-gray-500">
          No submissions yet.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <ul className="divide-y">
            {items.map((it) => (
              <li key={it._id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong className="text-gray-900">
                        {it.fullName || "Unnamed visitor"}
                      </strong>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_COLOR[it.status]}`}
                      >
                        {it.status.replace("_", " ")}
                      </span>
                      {it.interest && (
                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full">
                          {it.interest}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                      <a
                        href={`mailto:${it.email}`}
                        className="inline-flex items-center gap-1 hover:text-[#B8860B]"
                      >
                        <Mail className="w-3 h-3" /> {it.email}
                      </a>
                      <a
                        href={`tel:${it.countryCode || ""}${it.mobileNumber}`}
                        className="inline-flex items-center gap-1 hover:text-[#B8860B]"
                      >
                        <Phone className="w-3 h-3" />
                        {it.countryCode ? `${it.countryCode} ` : ""}
                        {it.mobileNumber}
                      </a>
                      <span>
                        {new Date(it.createdAt).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                        })}
                      </span>
                    </div>
                    {it.message && (
                      <div className="text-sm text-gray-700 mt-2 flex gap-2">
                        <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        <span className="whitespace-pre-wrap">
                          {it.message}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={it.status}
                      onChange={(e) =>
                        handleStatusChange(
                          it._id,
                          e.target.value as ContactSubmissionStatus,
                        )
                      }
                      disabled={updatingId === it._id}
                      className="px-2 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B8860B]"
                    >
                      {STATUS_OPTIONS.map((o) => (
                        <option key={o.v} value={o.v}>
                          {o.l}
                        </option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(it._id)}
                      leftIcon={<Trash2 className="w-4 h-4 text-red-500" />}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
