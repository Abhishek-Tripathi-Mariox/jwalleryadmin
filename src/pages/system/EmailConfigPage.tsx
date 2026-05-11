import React, { useState, useEffect } from "react";
import {
  Mail,
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
  type EmailConfig,
} from "../../services/systemConfigService";

export const EmailConfigPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [existingConfig, setExistingConfig] = useState<EmailConfig | null>(
    null,
  );

  const [formData, setFormData] = useState({
    provider: "smtp",
    host: "",
    port: "587",
    username: "",
    password: "",
  });

  const toast = useToast();

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await systemConfigService.getEmailConfig();
      if (response.data && response.data._id) {
        setExistingConfig(response.data);
        setFormData({
          provider: response.data.provider,
          host: "",
          port: "",
          username: "",
          password: "",
        });
      }
    } catch {
      // No config exists yet
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.host ||
      !formData.port ||
      !formData.username ||
      !formData.password
    ) {
      toast.error("All fields are required");
      return;
    }

    setIsLoading(true);
    try {
      await systemConfigService.saveEmailConfig(formData);
      toast.success("Email configuration saved successfully!");
      setFormData({
        ...formData,
        host: "",
        port: "",
        username: "",
        password: "",
      });
      await fetchConfig();
    } catch {
      toast.error("Failed to save email configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      const response = await systemConfigService.toggleEmailStatus();
      if (existingConfig) {
        setExistingConfig({
          ...existingConfig,
          isActive: response.data.isActive,
        });
      }
      toast.success(
        `Email service ${response.data.isActive ? "activated" : "deactivated"}`,
      );
    } catch {
      toast.error("Failed to toggle email status");
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
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Email Configuration
          </h1>
          <p className="text-gray-500 mt-1">
            Configure SMTP for transactional emails
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

      {/* Current Config Status */}
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
                Host
              </p>
              <p className="text-sm font-mono text-gray-900 mt-1">
                {existingConfig.credentials.host}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Port
              </p>
              <p className="text-sm font-mono text-gray-900 mt-1">
                {existingConfig.credentials.port}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Username
              </p>
              <p className="text-sm font-mono text-gray-900 mt-1">
                {existingConfig.credentials.username}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Password
              </p>
              <p className="text-sm font-mono text-gray-900 mt-1">
                {existingConfig.credentials.password}
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
                    <span className="text-sm font-medium text-green-700">
                      Active
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium text-red-700">
                      Inactive
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Config Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-6">
          <Mail className="w-5 h-5 text-[#B8860B]" />
          <h2 className="text-lg font-semibold text-gray-900">
            {existingConfig ? "Update" : "Setup"} Email Credentials
          </h2>
        </div>

        <p className="text-sm text-gray-500 mb-6 bg-amber-50 border border-amber-200 rounded-lg p-3">
          Credentials are encrypted with AES-256 before storing in the database.
          Enter all fields to update the configuration.
        </p>

        <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Provider
            </label>
            <select
              value={formData.provider}
              onChange={(e) =>
                setFormData({ ...formData, provider: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#B8860B] focus:border-transparent"
            >
              <option value="smtp">SMTP (Gmail, Outlook, etc.)</option>
              <option value="ses">Amazon SES</option>
              <option value="sendgrid">SendGrid</option>
            </select>
          </div>

          <Input
            label="SMTP Host"
            placeholder="e.g., smtp.gmail.com"
            value={formData.host}
            onChange={(e) =>
              setFormData({ ...formData, host: e.target.value })
            }
            required
          />

          <Input
            label="Port"
            placeholder="e.g., 587"
            value={formData.port}
            onChange={(e) =>
              setFormData({ ...formData, port: e.target.value })
            }
            required
          />

          <Input
            label="Username / Email"
            placeholder="e.g., noreply@swarnaz.com"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            required
          />

          <Input
            label="Password / App Password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter email password or app password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="focus:outline-none"
              >
                {showPassword ? (
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
