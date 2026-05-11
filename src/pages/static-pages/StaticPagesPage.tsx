import React, { useEffect, useState } from "react";
import { Loader2, Plus, Save, Trash2, Eye, EyeOff, FileText } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useToast } from "../../store/toastStore";
import {
  staticPageService,
  type StaticPage,
} from "../../services/staticPageService";

// Common slugs the website already routes to. Picking from this list keeps
// admin from misspelling slugs, but the form still allows free-text.
const COMMON_SLUGS = [
  { v: "about-us", l: "About Us" },
  { v: "our-story", l: "Our Story" },
  { v: "store-locator", l: "Store Locator" },
  { v: "privacy-policy", l: "Privacy Policy" },
  { v: "terms", l: "Terms of Service" },
  { v: "shipping-policy", l: "Shipping Policy" },
  { v: "return-policy", l: "Return Policy" },
  { v: "help", l: "Help" },
];

const blank: StaticPage = {
  slug: "",
  title: "",
  subtitle: "",
  content: "",
  seoDescription: "",
  isPublished: true,
};

export const StaticPagesPage: React.FC = () => {
  const toast = useToast();
  const [pages, setPages] = useState<StaticPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<StaticPage | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await staticPageService.list();
      setPages(res.data || []);
    } catch {
      toast.error("Failed to load pages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const openNew = () => setEditing({ ...blank });
  const openEdit = (p: StaticPage) => setEditing({ ...p });
  const close = () => setEditing(null);

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.slug.trim() || !editing.title.trim()) {
      toast.error("Slug and title are required");
      return;
    }
    setSaving(true);
    try {
      const res = await staticPageService.save({
        ...editing,
        slug: editing.slug.trim().toLowerCase(),
      });
      if (res?.code !== 1) {
        toast.error(res?.message || "Could not save");
        return;
      }
      toast.success("Page saved");
      close();
      fetchList();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: StaticPage) => {
    if (!p._id) return;
    if (!confirm(`Delete page "${p.title}"?`)) return;
    const res = await staticPageService.remove(p._id);
    if (res?.code !== 1) {
      toast.error(res?.message || "Could not delete");
      return;
    }
    toast.success("Page deleted");
    fetchList();
  };

  if (editing) {
    return (
      <div className="space-y-6 animate-fade-in max-w-4xl">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {editing._id ? "Edit Page" : "New Page"}
            </h1>
            <p className="text-gray-500 mt-1">
              Content shown on the public website at <code>/{editing.slug || "<slug>"}</code>.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={close}>Cancel</Button>
            <Button
              isLoading={saving}
              onClick={handleSave}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug
              </label>
              <input
                value={editing.slug}
                onChange={(e) =>
                  setEditing((p) => p && { ...p, slug: e.target.value })
                }
                placeholder="e.g. privacy-policy"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B8860B]"
                list="common-slugs"
              />
              <datalist id="common-slugs">
                {COMMON_SLUGS.map((s) => (
                  <option key={s.v} value={s.v}>
                    {s.l}
                  </option>
                ))}
              </datalist>
              <p className="text-xs text-gray-400 mt-1">
                Lowercase, dashes only. Maps to the website URL.
              </p>
            </div>
            <Input
              label="Title"
              value={editing.title}
              onChange={(e) =>
                setEditing((p) => p && { ...p, title: e.target.value })
              }
              placeholder="e.g. Privacy Policy"
              required
            />
          </div>

          <Input
            label="Subtitle (optional)"
            value={editing.subtitle || ""}
            onChange={(e) =>
              setEditing((p) => p && { ...p, subtitle: e.target.value })
            }
            placeholder="A one-liner shown under the title"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content (HTML)
            </label>
            <textarea
              rows={16}
              value={editing.content || ""}
              onChange={(e) =>
                setEditing((p) => p && { ...p, content: e.target.value })
              }
              placeholder={`<h2>About Swarnaz</h2>\n<p>Crafting timeless elegance since 1970…</p>`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B8860B] font-mono"
            />
            <p className="text-xs text-gray-400 mt-1">
              Supports HTML (<code>&lt;h2&gt;</code>, <code>&lt;p&gt;</code>,
              <code> &lt;ul&gt;</code>, <code>&lt;a&gt;</code>, <code>&lt;img&gt;</code>).
            </p>
          </div>

          <Input
            label="SEO description (optional)"
            value={editing.seoDescription || ""}
            onChange={(e) =>
              setEditing((p) => p && { ...p, seoDescription: e.target.value })
            }
            placeholder="Short summary used for search results"
          />

          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={editing.isPublished !== false}
              onChange={(e) =>
                setEditing((p) => p && { ...p, isPublished: e.target.checked })
              }
            />
            <span className="w-10 h-6 rounded-full bg-gray-200 peer-checked:bg-[#B8860B] relative transition-colors">
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 bg-white rounded-full transition-transform ${
                  editing.isPublished !== false ? "translate-x-4" : ""
                }`}
              />
            </span>
            <span className="text-sm text-gray-700">
              {editing.isPublished !== false ? "Published" : "Draft"}
            </span>
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Static Pages</h1>
          <p className="text-gray-500 mt-1">
            Marketing pages on the website — About, Privacy, Store Locator, etc.
          </p>
        </div>
        <Button onClick={openNew} leftIcon={<Plus className="w-4 h-4" />}>
          New page
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#B8860B]" />
        </div>
      ) : pages.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-10 text-center text-sm text-gray-500">
          No pages yet. Click "New page" to publish your first one.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <ul className="divide-y">
            {pages.map((p) => (
              <li key={p._id || p.slug} className="px-5 py-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-3 min-w-0">
                    <FileText className="w-5 h-5 text-[#B8860B] mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-gray-900">{p.title}</strong>
                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full font-mono">
                          /{p.slug}
                        </span>
                        {p.isPublished === false ? (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
                            <EyeOff className="w-3 h-3" /> Draft
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                            <Eye className="w-3 h-3" /> Published
                          </span>
                        )}
                      </div>
                      {p.subtitle && (
                        <p className="text-sm text-gray-500 mt-1">
                          {p.subtitle}
                        </p>
                      )}
                      {p.updatedAt && (
                        <p className="text-xs text-gray-400 mt-1">
                          Updated{" "}
                          {new Date(p.updatedAt).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "numeric",
                            minute: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(p)}
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
