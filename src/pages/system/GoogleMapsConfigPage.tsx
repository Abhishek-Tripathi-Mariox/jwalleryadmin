import React, { useState, useEffect } from "react";
import {
  MapPin,
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
  type GoogleMapsConfig,
} from "../../services/systemConfigService";

export const GoogleMapsConfigPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);
  const [existingConfig, setExistingConfig] =
    useState<GoogleMapsConfig | null>(null);

  const [formData, setFormData] = useState({
    provider: "google",
    apiKey: "",
  });

  const toast = useToast();

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await systemConfigService.getGoogleMapsConfig();
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
    if (!formData.apiKey) {
      toast.error("API Key is required");
      return;
    }
    setIsLoading(true);
    try {
      await systemConfigService.saveGoogleMapsConfig(formData);
      toast.success("Google Maps configuration saved!");
      setFormData({ ...formData, apiKey: "" });
      await fetchConfig();
    } catch {
      toast.error("Failed to save configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      const response = await systemConfigService.toggleGoogleMapsStatus();
      if (existingConfig) {
        setExistingConfig({
          ...existingConfig,
          isActive: response.data.isActive,
        });
      }
      toast.success(
        `Google Maps ${response.data.isActive ? "activated" : "deactivated"}`,
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
            Google Maps Configuration
          </h1>
          <p className="text-gray-500 mt-1">
            Configure Google Maps API for location services
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
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Provider
              </p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {existingConfig.provider.toUpperCase()}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                API Key
              </p>
              <p className="text-sm font-mono text-gray-900 mt-1">
                {existingConfig.credentials.apiKey}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Status
              </p>
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
          <MapPin className="w-5 h-5 text-[#B8860B]" />
          <h2 className="text-lg font-semibold text-gray-900">
            {existingConfig ? "Update" : "Setup"} Google Maps API Key
          </h2>
        </div>

        <p className="text-sm text-gray-500 mb-6 bg-amber-50 border border-amber-200 rounded-lg p-3">
          The API key is encrypted with AES-256 and sent to the mobile app
          securely after user login. Get your key from the Google Cloud Console.
        </p>

        <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
          <Input
            label="Google Maps API Key"
            type={showApiKey ? "text" : "password"}
            placeholder="Enter Google Maps API Key"
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
