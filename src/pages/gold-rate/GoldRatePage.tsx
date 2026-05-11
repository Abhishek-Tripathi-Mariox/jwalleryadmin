import React, { useEffect, useState } from "react";
import { Loader2, Save, TrendingUp } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useToast } from "../../store/toastStore";
import {
  goldRateMarkupService,
  KARAT_LABELS,
  type GoldRateMarkup,
  type Karat,
} from "../../services/goldRateMarkupService";

const ALL_KARATS: Karat[] = ["24K", "22K", "18K", "SILVER"];

const blankRow = (k: Karat): GoldRateMarkup => ({
  karat: k,
  flat: 0,
  percent: 0,
  liveRate: null,
  finalRate: null,
  updatedAt: null,
});

interface RowState {
  flat: string;
  percent: string;
  saving: boolean;
}

const formatRate = (n: number | null | undefined) =>
  n == null ? "—" : `₹${n.toLocaleString("en-IN")}/g`;

export const GoldRatePage: React.FC = () => {
  const [rows, setRows] = useState<GoldRateMarkup[]>([]);
  const [state, setState] = useState<Record<Karat, RowState>>({} as Record<Karat, RowState>);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchRows();
  }, []);

  const fetchRows = async () => {
    setIsLoading(true);
    let list: GoldRateMarkup[] = [];
    try {
      const res = await goldRateMarkupService.getAll();
      list = Array.isArray(res.data) ? res.data : [];
    } catch {
      toast.error("Failed to load live rate, you can still edit markup");
    }

    const byKarat = new Map(list.map((r) => [r.karat, r]));
    const merged = ALL_KARATS.map((k) => byKarat.get(k) ?? blankRow(k));
    setRows(merged);

    const next: Record<Karat, RowState> = {} as Record<Karat, RowState>;
    for (const r of merged) {
      next[r.karat] = {
        flat: String(r.flat ?? 0),
        percent: String(r.percent ?? 0),
        saving: false,
      };
    }
    setState(next);
    setIsLoading(false);
  };

  const updateField = (karat: Karat, field: "flat" | "percent", value: string) => {
    setState((s) => ({
      ...s,
      [karat]: { ...s[karat], [field]: value },
    }));
  };

  const handleSave = async (karat: Karat) => {
    const flat = Number(state[karat]?.flat || 0);
    const percent = Number(state[karat]?.percent || 0);
    if (isNaN(flat) || flat < 0 || isNaN(percent) || percent < 0) {
      toast.error("Markup values must be non-negative numbers");
      return;
    }
    setState((s) => ({ ...s, [karat]: { ...s[karat], saving: true } }));
    try {
      await goldRateMarkupService.upsert(karat, flat, percent);
      toast.success(`${karat} markup saved`);
      await fetchRows();
    } catch {
      toast.error("Failed to save markup");
      setState((s) => ({ ...s, [karat]: { ...s[karat], saving: false } }));
    }
  };

  const previewFinal = (row: GoldRateMarkup): number | null => {
    if (row.liveRate == null) return null;
    const flat = Number(state[row.karat]?.flat || 0);
    const percent = Number(state[row.karat]?.percent || 0);
    if (isNaN(flat) || isNaN(percent)) return null;
    return Math.round(row.liveRate * (1 + percent / 100) + flat);
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Gold Rate Markup</h1>
        <p className="text-gray-500 mt-1">
          Add a markup on top of the live rate. Displayed rate = live × (1 + %) + ₹ flat.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rows.map((row) => {
          const rs = state[row.karat] || { flat: "0", percent: "0", saving: false };
          const preview = previewFinal(row);
          return (
            <div
              key={row.karat}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div className="px-5 py-4 border-b flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {KARAT_LABELS[row.karat]}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">{row.karat}</p>
                </div>
                <TrendingUp className="w-5 h-5 text-[#B8860B]" />
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 rounded p-3">
                    <div className="text-xs text-gray-500">Live rate</div>
                    <div className="font-semibold text-gray-900 mt-1">
                      {formatRate(row.liveRate)}
                    </div>
                  </div>
                  <div className="bg-amber-50 rounded p-3">
                    <div className="text-xs text-amber-700">Displayed</div>
                    <div className="font-semibold text-amber-900 mt-1">
                      {formatRate(preview ?? row.finalRate)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Percent uplift (%)"
                    type="number"
                    min={0}
                    step="0.01"
                    value={rs.percent}
                    onChange={(e) => updateField(row.karat, "percent", e.target.value)}
                  />
                  <Input
                    label="Flat (₹/g)"
                    type="number"
                    min={0}
                    step="1"
                    value={rs.flat}
                    onChange={(e) => updateField(row.karat, "flat", e.target.value)}
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    size="sm"
                    isLoading={rs.saving}
                    leftIcon={<Save className="w-4 h-4" />}
                    onClick={() => handleSave(row.karat)}
                  >
                    Save
                  </Button>
                </div>

                {row.updatedAt && (
                  <p className="text-xs text-gray-400">
                    Last updated{" "}
                    {new Date(row.updatedAt).toLocaleString("en-IN", {
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
          );
        })}
      </div>
    </div>
  );
};
