import React, { useState, useEffect } from "react";
import {
  MessageCircle,
  Save,
  Power,
  Loader2,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  Clock,
  Plus,
  Trash2,
  HelpCircle,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useToast } from "../../store/toastStore";
import {
  systemConfigService,
  type SupportConfig,
  type ChatBotMessage,
} from "../../services/systemConfigService";

const DEFAULT_BOT_MESSAGES: ChatBotMessage[] = [
  { id: 1, question: "Track my order", answer: "Please provide your order ID to track your order status." },
  { id: 2, question: "Return & Exchange", answer: "We offer 7-day easy returns. Items must be unused with original packaging." },
  { id: 3, question: "Payment options", answer: "We accept UPI, Credit/Debit cards, Net Banking, and Cash on Delivery." },
  { id: 4, question: "Shipping info", answer: "Free shipping on orders above ₹999. Standard delivery takes 5-7 business days." },
  { id: 5, question: "Talk to support", answer: "connect_support" },
];

export const SupportConfigPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [existingConfig, setExistingConfig] = useState<SupportConfig | null>(null);

  const [formData, setFormData] = useState({
    phone: "",
    email: "",
    whatsapp: "",
    address: "",
    workingHours: "9:00 AM - 6:00 PM",
  });

  const [chatBotMessages, setChatBotMessages] = useState<ChatBotMessage[]>(DEFAULT_BOT_MESSAGES);

  const toast = useToast();

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await systemConfigService.getSupportConfig();
      if (response.data && response.data._id) {
        setExistingConfig(response.data);
        setFormData({
          phone: response.data.credentials?.phone || "",
          email: response.data.credentials?.email || "",
          whatsapp: response.data.credentials?.whatsapp || "",
          address: response.data.credentials?.address || "",
          workingHours: response.data.credentials?.workingHours || "9:00 AM - 6:00 PM",
        });
        // Parse chatbot messages from JSON string
        if (response.data.credentials?.chatBotMessages) {
          try {
            const messages = JSON.parse(response.data.credentials.chatBotMessages);
            if (Array.isArray(messages) && messages.length > 0) {
              setChatBotMessages(messages);
            }
          } catch {
            // Keep default messages
          }
        }
      }
    } catch {
      // No config exists yet
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.phone || !formData.email) {
      toast.error("Phone and Email are required");
      return;
    }

    setIsLoading(true);
    try {
      await systemConfigService.saveSupportConfig({
        ...formData,
        chatBotMessages,
      });
      toast.success("Support configuration saved successfully!");
      await fetchConfig();
    } catch {
      toast.error("Failed to save support configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      const response = await systemConfigService.toggleSupportStatus();
      if (existingConfig) {
        setExistingConfig({
          ...existingConfig,
          isActive: response.data.isActive,
        });
      }
      toast.success(
        `Support feature ${response.data.isActive ? "activated" : "deactivated"}`
      );
    } catch {
      toast.error("Failed to toggle support status");
    }
  };

  const handleAddMessage = () => {
    const newId = Math.max(...chatBotMessages.map((m) => m.id), 0) + 1;
    setChatBotMessages([
      ...chatBotMessages,
      { id: newId, question: "", answer: "" },
    ]);
  };

  const handleRemoveMessage = (id: number) => {
    if (chatBotMessages.length <= 1) {
      toast.error("At least one chatbot message is required");
      return;
    }
    setChatBotMessages(chatBotMessages.filter((m) => m.id !== id));
  };

  const handleMessageChange = (
    id: number,
    field: "question" | "answer",
    value: string
  ) => {
    setChatBotMessages(
      chatBotMessages.map((m) =>
        m.id === id ? { ...m, [field]: value } : m
      )
    );
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
            Support & Contact Configuration
          </h1>
          <p className="text-gray-500 mt-1">
            Configure customer support contact info and chatbot messages
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
            <MessageCircle className="w-5 h-5 text-[#B8860B]" />
            <h2 className="text-lg font-semibold text-gray-900">
              Current Configuration
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Phone
              </p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {existingConfig.credentials?.phone || "Not set"}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Email
              </p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {existingConfig.credentials?.email || "Not set"}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                WhatsApp
              </p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {existingConfig.credentials?.whatsapp || "Not set"}
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
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <Phone className="w-5 h-5 text-[#B8860B]" />
            <h2 className="text-lg font-semibold text-gray-900">
              Contact Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl">
            <Input
              label="Phone Number"
              placeholder="e.g., +91 9876543210"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              leftIcon={<Phone className="w-4 h-4" />}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="e.g., support@jewellery.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="WhatsApp Number"
              placeholder="e.g., +91 9876543210"
              value={formData.whatsapp}
              onChange={(e) =>
                setFormData({ ...formData, whatsapp: e.target.value })
              }
              leftIcon={<MessageCircle className="w-4 h-4" />}
            />

            <Input
              label="Working Hours"
              placeholder="e.g., 9:00 AM - 6:00 PM"
              value={formData.workingHours}
              onChange={(e) =>
                setFormData({ ...formData, workingHours: e.target.value })
              }
              leftIcon={<Clock className="w-4 h-4" />}
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              rows={2}
              placeholder="Street, City, State, Pincode"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B8860B] focus:border-transparent"
            />
            <p className="text-xs text-gray-400 mt-1">
              Shown on the website Contact Us page.
            </p>
          </div>
        </div>

        {/* Chatbot Messages */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#B8860B]" />
              <h2 className="text-lg font-semibold text-gray-900">
                Chatbot Quick Responses
              </h2>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddMessage}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Question
            </Button>
          </div>

          <p className="text-sm text-gray-500 mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            Configure automatic responses for common questions. Use{" "}
            <code className="bg-blue-100 px-1 rounded">connect_support</code> as the answer to show contact options instead.
          </p>

          <div className="space-y-4">
            {chatBotMessages.map((msg, index) => (
              <div
                key={msg.id}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Question {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMessage(msg.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Question Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Track my order"
                      value={msg.question}
                      onChange={(e) =>
                        handleMessageChange(msg.id, "question", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B8860B] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Bot Response
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Please provide your order ID..."
                      value={msg.answer}
                      onChange={(e) =>
                        handleMessageChange(msg.id, "answer", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B8860B] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" isLoading={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </form>
    </div>
  );
};
