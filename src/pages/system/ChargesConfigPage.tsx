import React, { useEffect, useState } from "react";
import { Loader2, Save, Truck, Percent } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useToast } from "../../store/toastStore";
import {
  chargeConfigService,
  type ChargeConfig,
} from "../../services/chargeConfigService";

type FormState = {
  shippingActive: boolean;
  shippingFlat: string;
  freeShippingThreshold: string;
  platformFeeActive: boolean;
  platformFeeFlat: string;
  platformFeePercent: string;
  prepaidDiscountActive: boolean;
  prepaidDiscountPercent: string;
};

const toForm = (c: ChargeConfig): FormState => ({
  shippingActive: !!c.shippingActive,
  shippingFlat: String(c.shippingFlat ?? 0),
  freeShippingThreshold: String(c.freeShippingThreshold ?? 0),
  platformFeeActive: !!c.platformFeeActive,
  platformFeeFlat: String(c.platformFeeFlat ?? 0),
  platformFeePercent: String(c.platformFeePercent ?? 0),
  prepaidDiscountActive: c.prepaidDiscountActive ?? true,
  prepaidDiscountPercent: String(c.prepaidDiscountPercent ?? 2),
});

const blank: FormState = {
  shippingActive: true,
  shippingFlat: "49",
  freeShippingThreshold: "999",
  platformFeeActive: false,
  platformFeeFlat: "0",
  platformFeePercent: "0",
  prepaidDiscountActive: true,
  prepaidDiscountPercent: "2",
};

const fmt = (n: number) =>
  `₹${Number.isFinite(n) ? Math.round(n).toLocaleString("en-IN") : 0}`;

export const ChargesConfigPage: React.FC = () => {
  const toast = useToast();
  const [form, setForm] = useState<FormState>(blank);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  // Preview subtotal for the breakdown widget.
  const [previewSubtotal, setPreviewSubtotal] = useState("2500");

  useEffect(() => {
    (async () => {
      try {
        const res = await chargeConfigService.get();
        if (res?.data) {
          setForm(toForm(res.data));
          setUpdatedAt(res.data.updatedAt || null);
        }
      } catch {
        toast.error("Failed to load charges config");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setField =
    <K extends keyof FormState>(k: K) =>
    (v: FormState[K]) =>
      setForm((s) => ({ ...s, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const patch = {
        shippingActive: form.shippingActive,
        shippingFlat: Number(form.shippingFlat) || 0,
        freeShippingThreshold: Number(form.freeShippingThreshold) || 0,
        platformFeeActive: form.platformFeeActive,
        platformFeeFlat: Number(form.platformFeeFlat) || 0,
        platformFeePercent: Number(form.platformFeePercent) || 0,
        prepaidDiscountActive: form.prepaidDiscountActive,
        prepaidDiscountPercent: Number(form.prepaidDiscountPercent) || 0,
      };
      const res = await chargeConfigService.update(patch);
      if (res?.code === 1 && res.data) {
        toast.success("Charges saved");
        setUpdatedAt(res.data.updatedAt || new Date().toISOString());
      } else {
        toast.error(res?.message || "Failed to save");
      }
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // Live preview using the current form values (mirrors backend math).
  const preview = (() => {
    const subtotal = Number(previewSubtotal) || 0;
    const shippingFlat = Number(form.shippingFlat) || 0;
    const threshold = Number(form.freeShippingThreshold) || 0;
    const platformFlat = Number(form.platformFeeFlat) || 0;
    const platformPct = Number(form.platformFeePercent) || 0;

    const shipping = form.shippingActive
      ? subtotal >= threshold
        ? 0
        : shippingFlat
      : 0;
    const platform = form.platformFeeActive
      ? Math.round(Math.max(platformFlat, (subtotal * platformPct) / 100))
      : 0;
    const total = subtotal + shipping + platform;
    return { subtotal, shipping, platform, total };
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#B8860B]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Shipping & Platform Fee</h1>
        <p className="text-gray-500 mt-1">
          Set the cart-level shipping rule and optional platform fee. Changes apply to all new orders immediately.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shipping card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#B8860B]" />
                <h2 className="font-semibold text-gray-900">Shipping</h2>
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={form.shippingActive}
                  onChange={(e) => setField("shippingActive")(e.target.checked)}
                />
                <span className="w-10 h-6 rounded-full bg-gray-200 peer-checked:bg-[#B8860B] relative transition-colors">
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 bg-white rounded-full transition-transform ${
                      form.shippingActive ? "translate-x-4" : ""
                    }`}
                  />
                </span>
                <span className="text-sm text-gray-700">
                  {form.shippingActive ? "Active" : "Disabled"}
                </span>
              </label>
            </div>

            <p className="text-sm text-gray-500">
              Charge a flat shipping fee for orders below the free-shipping threshold.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Shipping fee (₹)"
                type="number"
                min={0}
                value={form.shippingFlat}
                onChange={(e) => setField("shippingFlat")(e.target.value)}
                disabled={!form.shippingActive}
              />
              <Input
                label="Free shipping above (₹)"
                type="number"
                min={0}
                value={form.freeShippingThreshold}
                onChange={(e) =>
                  setField("freeShippingThreshold")(e.target.value)
                }
                disabled={!form.shippingActive}
                helperText="Carts with subtotal ≥ this amount get free shipping."
              />
            </div>
          </div>

          {/* Platform fee card */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Percent className="w-5 h-5 text-[#B8860B]" />
                <h2 className="font-semibold text-gray-900">Platform fee</h2>
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={form.platformFeeActive}
                  onChange={(e) =>
                    setField("platformFeeActive")(e.target.checked)
                  }
                />
                <span className="w-10 h-6 rounded-full bg-gray-200 peer-checked:bg-[#B8860B] relative transition-colors">
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 bg-white rounded-full transition-transform ${
                      form.platformFeeActive ? "translate-x-4" : ""
                    }`}
                  />
                </span>
                <span className="text-sm text-gray-700">
                  {form.platformFeeActive ? "Active" : "Disabled"}
                </span>
              </label>
            </div>

            <p className="text-sm text-gray-500">
              We charge whichever is higher: the flat amount or the percentage of (subtotal − coupon discount).
              Set one of them to 0 to use only the other.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Flat fee (₹)"
                type="number"
                min={0}
                value={form.platformFeeFlat}
                onChange={(e) => setField("platformFeeFlat")(e.target.value)}
                disabled={!form.platformFeeActive}
              />
              <Input
                label="Percent of subtotal (%)"
                type="number"
                min={0}
                step="0.01"
                value={form.platformFeePercent}
                onChange={(e) =>
                  setField("platformFeePercent")(e.target.value)
                }
                disabled={!form.platformFeeActive}
              />
            </div>
          </div>

          {/* Prepaid discount card */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Percent className="w-5 h-5 text-[#B8860B]" />
                <h2 className="font-semibold text-gray-900">Prepaid discount</h2>
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={form.prepaidDiscountActive}
                  onChange={(e) =>
                    setField("prepaidDiscountActive")(e.target.checked)
                  }
                />
                <span className="w-10 h-6 rounded-full bg-gray-200 peer-checked:bg-[#B8860B] relative transition-colors">
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 bg-white rounded-full transition-transform ${
                      form.prepaidDiscountActive ? "translate-x-4" : ""
                    }`}
                  />
                </span>
                <span className="text-sm text-gray-700">
                  {form.prepaidDiscountActive ? "Active" : "Disabled"}
                </span>
              </label>
            </div>

            <p className="text-sm text-gray-500">
              Customers who choose to pay online (prepaid) get this % off the
              subtotal automatically. Cash-on-Delivery orders never get it.
            </p>

            <Input
              label="Prepaid discount (%)"
              type="number"
              min={0}
              step="0.01"
              value={form.prepaidDiscountPercent}
              onChange={(e) =>
                setField("prepaidDiscountPercent")(e.target.value)
              }
              disabled={!form.prepaidDiscountActive}
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">
              {updatedAt
                ? `Last saved ${new Date(updatedAt).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                  })}`
                : "Not yet saved"}
            </p>
            <Button
              isLoading={saving}
              onClick={handleSave}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save changes
            </Button>
          </div>
        </div>

        {/* Preview card */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4 h-fit sticky top-4">
          <h2 className="font-semibold text-gray-900">Live preview</h2>
          <p className="text-xs text-gray-500">
            See how the cart breakdown will look for a chosen subtotal.
          </p>
          <Input
            label="Sample subtotal (₹)"
            type="number"
            min={0}
            value={previewSubtotal}
            onChange={(e) => setPreviewSubtotal(e.target.value)}
          />
          <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>{fmt(preview.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Shipping</span>
              <span className={preview.shipping === 0 ? "text-green-600 font-medium" : ""}>
                {preview.shipping === 0 ? "FREE" : fmt(preview.shipping)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Platform fee</span>
              <span>{preview.platform === 0 ? "—" : fmt(preview.platform)}</span>
            </div>
            <div className="h-px bg-gray-200 my-1" />
            <div className="flex justify-between font-semibold text-gray-900">
              <span>Total</span>
              <span>{fmt(preview.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
