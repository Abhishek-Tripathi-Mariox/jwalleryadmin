import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Save,
  Eye,
  EyeOff,
  Send,
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
  type SmsConfig,
} from "../../services/systemConfigService";

export const SmsConfigPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [showAuthKey, setShowAuthKey] = useState(false);
  const [existingConfig, setExistingConfig] = useState<SmsConfig | null>(null);
  const [testNumber, setTestNumber] = useState("");

  const [formData, setFormData] = useState({
    provider: "msg91",
    authKey: "",
    templateId: "",
    senderId: "",
  });

  const toast = useToast();

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await systemConfigService.getSmsConfig();
      if (response.data && response.data._id) {
        setExistingConfig(response.data);
        setFormData({
          provider: response.data.provider,
          authKey: "",
          templateId: "",
          senderId: "",
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

    if (!formData.authKey || !formData.templateId || !formData.senderId) {
      toast.error("All fields are required");
      return;
    }

    setIsLoading(true);
    try {
      await systemConfigService.saveSmsConfig(formData);
      toast.success("SMS configuration saved successfully!");
      setFormData({ ...formData, authKey: "", templateId: "", senderId: "" });
      await fetchConfig();
    } catch {
      toast.error("Failed to save SMS configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      const response = await systemConfigService.toggleSmsStatus();
      if (existingConfig) {
        setExistingConfig({
          ...existingConfig,
          isActive: response.data.isActive,
        });
      }
      toast.success(
        `SMS service ${response.data.isActive ? "activated" : "deactivated"}`,
      );
    } catch {
      toast.error("Failed to toggle SMS status");
    }
  };

  const handleTestSms = async () => {
    if (!testNumber || testNumber.length !== 10) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }

    setIsTesting(true);
    try {
      const response = await systemConfigService.testSms(testNumber);
      if (response.data.success) {
        toast.success("Test SMS sent successfully!");
      } else {
        toast.error(response.data.message || "Failed to send test SMS");
      }
    } catch {
      toast.error("Failed to send test SMS");
    } finally {
      setIsTesting(false);
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
            SMS Configuration
          </h1>
          <p className="text-gray-500 mt-1">
            Configure MSG91 for OTP and transactional SMS
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
                Auth Key
              </p>
              <p className="text-sm font-mono text-gray-900 mt-1">
                {existingConfig.credentials.authKey}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Template ID
              </p>
              <p className="text-sm font-mono text-gray-900 mt-1">
                {existingConfig.credentials.templateId}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Sender ID
              </p>
              <p className="text-sm font-mono text-gray-900 mt-1">
                {existingConfig.credentials.senderId}
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
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Last Updated
              </p>
              <p className="text-sm text-gray-900 mt-1">
                {new Date(existingConfig.updatedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Config Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="w-5 h-5 text-[#B8860B]" />
          <h2 className="text-lg font-semibold text-gray-900">
            {existingConfig ? "Update" : "Setup"} SMS Credentials
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
              <option value="msg91">MSG91</option>
            </select>
          </div>

          <Input
            label="Auth Key"
            type={showAuthKey ? "text" : "password"}
            placeholder="Enter MSG91 Auth Key"
            value={formData.authKey}
            onChange={(e) =>
              setFormData({ ...formData, authKey: e.target.value })
            }
            required
            rightIcon={
              <button
                type="button"
                onClick={() => setShowAuthKey(!showAuthKey)}
                className="focus:outline-none"
              >
                {showAuthKey ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            }
          />

          <Input
            label="Template ID"
            placeholder="Enter MSG91 Template ID"
            value={formData.templateId}
            onChange={(e) =>
              setFormData({ ...formData, templateId: e.target.value })
            }
            required
          />

          <Input
            label="Sender ID"
            placeholder="Enter 6-letter Sender ID (e.g., SWRNAZ)"
            value={formData.senderId}
            onChange={(e) =>
              setFormData({ ...formData, senderId: e.target.value })
            }
            maxLength={6}
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

      {/* Test SMS */}
      {existingConfig && existingConfig.isActive && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Send className="w-5 h-5 text-[#B8860B]" />
            <h2 className="text-lg font-semibold text-gray-900">
              Test SMS
            </h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Send a test OTP (123456) to verify your configuration is working.
          </p>
          <div className="flex items-end gap-3 max-w-lg">
            <div className="flex-1">
              <Input
                label="Mobile Number"
                placeholder="Enter 10-digit mobile number"
                value={testNumber}
                onChange={(e) =>
                  setTestNumber(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                maxLength={10}
              />
            </div>
            <Button
              onClick={handleTestSms}
              isLoading={isTesting}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Send Test
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
