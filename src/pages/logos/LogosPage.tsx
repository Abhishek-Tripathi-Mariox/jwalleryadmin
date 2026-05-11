import React, { useState, useEffect, useRef } from "react";
import { ImageIcon, Upload, Trash2, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../store/toastStore";
import { logoService, LOGO_TYPES, type Logo } from "../../services/logoService";

export const LogosPage: React.FC = () => {
  const [logos, setLogos] = useState<Logo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const toast = useToast();

  useEffect(() => {
    fetchLogos();
  }, []);

  const fetchLogos = async () => {
    try {
      const res = await logoService.getAll();
      if (res.data) setLogos(Array.isArray(res.data) ? res.data : []);
    } catch {
      // empty
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (type: string, file: File) => {
    setUploading(type);
    try {
      await logoService.upload(type, file);
      toast.success("Logo uploaded successfully!");
      await fetchLogos();
    } catch {
      toast.error("Failed to upload logo");
    } finally {
      setUploading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this logo?")) return;
    try {
      await logoService.delete(id);
      toast.success("Logo deleted");
      await fetchLogos();
    } catch {
      toast.error("Failed to delete logo");
    }
  };

  const getLogoByType = (type: string) => logos.find((l) => l.type === type);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#B8860B]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Logo Management</h1>
        <p className="text-gray-500 mt-1">
          Upload and manage logos for your brand across platforms
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {LOGO_TYPES.map((logoType) => {
          const existing = getLogoByType(logoType.key);
          const isUploading = uploading === logoType.key;

          return (
            <div
              key={logoType.key}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              {/* Preview */}
              <div className="h-40 bg-gray-100 flex items-center justify-center p-4 border-b">
                {existing ? (
                  <img
                    src={existing.imageUrl}
                    alt={logoType.label}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-center text-gray-400">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">No logo uploaded</p>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">
                  {logoType.label}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{logoType.desc}</p>

                {existing && (
                  <p className="text-xs text-gray-400 mt-2">
                    Updated{" "}
                    {new Date(existing.updatedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={(el) => {
                      fileInputRefs.current[logoType.key] = el;
                    }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(logoType.key, file);
                      e.target.value = "";
                    }}
                  />
                  <Button
                    size="sm"
                    variant={existing ? "outline" : "primary"}
                    isLoading={isUploading}
                    leftIcon={<Upload className="w-4 h-4" />}
                    onClick={() =>
                      fileInputRefs.current[logoType.key]?.click()
                    }
                  >
                    {existing ? "Replace" : "Upload"}
                  </Button>
                  {existing && (
                    <Button
                      size="sm"
                      variant="danger"
                      leftIcon={<Trash2 className="w-4 h-4" />}
                      onClick={() => handleDelete(existing._id)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
