import React, { useState, useEffect } from "react";
import {
  CreditCard,
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
  type PaymentConfig,
} from "../../services/systemConfigService";

export const PaymentConfigPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [showKeySecret, setShowKeySecret] = useState(false);
  const [existingConfig, setExistingConfig] = useState<PaymentConfig | null>(
    null,
  );

  const [formData, setFormData] = useState({
    provider: "razorpay",
    keyId: "",
    keySecret: "",
    webhookSecret: "",
  });

  const toast = useToast();

  const webhookUrl = `${(import.meta.env.VITE_API_BASE_URL || "http://localhost:9110/v1/api").replace(/\/$/, "")}/webhooks/razorpay`;

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await systemConfigService.getPaymentConfig();
      if (response.data && response.data._id) {
        setExistingConfig(response.data);
        setFormData({
          provider: response.data.provider,
          keyId: "",
          keySecret: "",
          webhookSecret: "",
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

    if (!formData.keyId || !formData.keySecret) {
      toast.error("All fields are required");
      return;
    }

    setIsLoading(true);
    try {
      await systemConfigService.savePaymentConfig(formData);
      toast.success("Payment configuration saved successfully!");
      setFormData({ ...formData, keyId: "", keySecret: "", webhookSecret: "" });
      await fetchConfig();
    } catch {
      toast.error("Failed to save payment configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      const response = await systemConfigService.togglePaymentStatus();
      if (existingConfig) {
        setExistingConfig({
          ...existingConfig,
          isActive: response.data.isActive,
        });
      }
      toast.success(
        `Payment gateway ${response.data.isActive ? "activated" : "deactivated"}`,
      );
    } catch {
      toast.error("Failed to toggle payment status");
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
            Payment Gateway Configuration
          </h1>
          <p className="text-gray-500 mt-1">
            Configure Razorpay for payment processing
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
                Key ID
              </p>
              <p className="text-sm font-mono text-gray-900 mt-1">
                {existingConfig.credentials.keyId}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Key Secret
              </p>
              <p className="text-sm font-mono text-gray-900 mt-1">
                {existingConfig.credentials.keySecret}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Webhook
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                {existingConfig.credentials.webhookSecret ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-green-700">
                      Configured
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium text-amber-700">
                      Not set up
                    </span>
                  </>
                )}
              </div>
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
                {new Date(existingConfig.updatedAt).toLocaleDateString(
                  "en-IN",
                  {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  },
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Config Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-6">
          <CreditCard className="w-5 h-5 text-[#B8860B]" />
          <h2 className="text-lg font-semibold text-gray-900">
            {existingConfig ? "Update" : "Setup"} Payment Credentials
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
              <option value="razorpay">Razorpay</option>
            </select>
          </div>

          <Input
            label="Key ID"
            placeholder="Enter Razorpay Key ID (e.g., rzp_live_...)"
            value={formData.keyId}
            onChange={(e) =>
              setFormData({ ...formData, keyId: e.target.value })
            }
            required
          />

          <Input
            label="Key Secret"
            type={showKeySecret ? "text" : "password"}
            placeholder="Enter Razorpay Key Secret"
            value={formData.keySecret}
            onChange={(e) =>
              setFormData({ ...formData, keySecret: e.target.value })
            }
            required
            rightIcon={
              <button
                type="button"
                onClick={() => setShowKeySecret(!showKeySecret)}
                className="focus:outline-none"
              >
                {showKeySecret ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            }
          />

          <div>
            <Input
              label="Webhook Secret (optional, but strongly recommended)"
              type={showKeySecret ? "text" : "password"}
              placeholder="Paste the secret you set for this webhook in Razorpay"
              value={formData.webhookSecret}
              onChange={(e) =>
                setFormData({ ...formData, webhookSecret: e.target.value })
              }
            />
            <p className="text-xs text-gray-500 mt-1">
              Without this, payments only get confirmed when the customer's app calls back —
              if they close the app right after paying, the order can get stuck as "pending"
              even though Razorpay captured the money. Set up the webhook below to fix that.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs font-medium text-blue-900 uppercase tracking-wide mb-1">
              Webhook URL — add this in Razorpay Dashboard → Settings → Webhooks
            </p>
            <p className="text-sm font-mono text-blue-900 break-all">{webhookUrl}</p>
            <p className="text-xs text-blue-800 mt-1">
              Active events to select there: <strong>payment.captured</strong> and{" "}
              <strong>payment.failed</strong>. Use the same secret you enter above.
            </p>
          </div>

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
