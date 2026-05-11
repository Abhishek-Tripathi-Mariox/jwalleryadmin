import React, { useState, useEffect } from "react";
import {
  Flame,
  Save,
  Eye,
  EyeOff,
  Power,
  Loader2,
  CheckCircle,
  XCircle,
  Shield,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useToast } from "../../store/toastStore";
import {
  systemConfigService,
  type FirebaseConfig,
} from "../../services/systemConfigService";

export const FirebaseConfigPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);
  const [existingConfig, setExistingConfig] =
    useState<FirebaseConfig | null>(null);

  const [formData, setFormData] = useState({
    provider: "firebase",
    apiKey: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
  });

  const toast = useToast();

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await systemConfigService.getFirebaseConfig();
      if (response.data && response.data._id) {
        setExistingConfig(response.data);
      }
    } catch {
      // No config exists yet
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.apiKey || !formData.projectId || !formData.appId) {
      toast.error("API Key, Project ID, and App ID are required");
      return;
    }
    setIsLoading(true);
    try {
      await systemConfigService.saveFirebaseConfig(formData);
      toast.success("Firebase configuration saved!");
      setFormData({
        ...formData,
        apiKey: "",
        projectId: "",
        storageBucket: "",
        messagingSenderId: "",
        appId: "",
      });
      await fetchConfig();
    } catch {
      toast.error("Failed to save configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      const response = await systemConfigService.toggleFirebaseStatus();
      if (existingConfig) {
        setExistingConfig({
          ...existingConfig,
          isActive: response.data.isActive,
        });
      }
      toast.success(
        `Firebase ${response.data.isActive ? "activated" : "deactivated"}`,
      );
    } catch {
      toast.error("Failed to toggle status");
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#B8860B]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Firebase Configuration
          </h1>
          <p className="text-gray-500 mt-1">
            Configure Firebase for push notifications, analytics & more
          </p>
        </div>
        {existingConfig && (
          <button
            onClick={handleToggleStatus}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              existingConfig.isActive
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-red-100 text-red-700 hover:bg-red-200"
            }`}
          >
            <Power className="w-4 h-4" />
            {existingConfig.isActive ? "Active" : "Inactive"}
          </button>
        )}
      </div>

      {existingConfig && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-[#B8860B]" />
            <h2 className="text-lg font-semibold text-gray-900">
              Current Configuration
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">API Key</p>
              <p className="text-sm font-mono text-gray-900 mt-1">
                {existingConfig.credentials.apiKey}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Project ID</p>
              <p className="text-sm font-mono text-gray-900 mt-1">
                {existingConfig.credentials.projectId}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">App ID</p>
              <p className="text-sm font-mono text-gray-900 mt-1">
                {existingConfig.credentials.appId}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Storage Bucket</p>
              <p className="text-sm font-mono text-gray-900 mt-1">
                {existingConfig.credentials.storageBucket || "—"}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Messaging Sender ID</p>
              <p className="text-sm font-mono text-gray-900 mt-1">
                {existingConfig.credentials.messagingSenderId || "—"}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
              <div className="flex items-center gap-1.5 mt-1">
                {existingConfig.isActive ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-green-700">Active</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium text-red-700">Inactive</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-6">
          <Flame className="w-5 h-5 text-[#B8860B]" />
          <h2 className="text-lg font-semibold text-gray-900">
            {existingConfig ? "Update" : "Setup"} Firebase Credentials
          </h2>
        </div>

        <p className="text-sm text-gray-500 mb-6 bg-amber-50 border border-amber-200 rounded-lg p-3">
          All credentials are encrypted with AES-256 and sent securely to the
          mobile app after login. Get these from Firebase Console &gt; Project Settings.
        </p>

        <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
          <Input
            label="API Key"
            type={showApiKey ? "text" : "password"}
            placeholder="Enter Firebase API Key"
            value={formData.apiKey}
            onChange={(e) =>
              setFormData({ ...formData, apiKey: e.target.value })
            }
            required
            rightIcon={
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="focus:outline-none"
              >
                {showApiKey ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            }
          />

          <Input
            label="Project ID"
            placeholder="e.g., swarnaz-jewelry"
            value={formData.projectId}
            onChange={(e) =>
              setFormData({ ...formData, projectId: e.target.value })
            }
            required
          />

          <Input
            label="Storage Bucket"
            placeholder="e.g., swarnaz-jewelry.appspot.com"
            value={formData.storageBucket}
            onChange={(e) =>
              setFormData({ ...formData, storageBucket: e.target.value })
            }
          />

          <Input
            label="Messaging Sender ID"
            placeholder="e.g., 123456789012"
            value={formData.messagingSenderId}
            onChange={(e) =>
              setFormData({ ...formData, messagingSenderId: e.target.value })
            }
          />

          <Input
            label="App ID"
            placeholder="e.g., 1:123456789:android:abc123"
            value={formData.appId}
            onChange={(e) =>
              setFormData({ ...formData, appId: e.target.value })
            }
            required
          />

          <Button
            type="submit"
            isLoading={isLoading}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Configuration
          </Button>
        </form>
      </div>
    </div>
  );
};
