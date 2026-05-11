/**
 * Format a number as INR currency.
 * Example: formatCurrency(1500) => "₹1,500"
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Payment status → Badge variant mapping
 */
export const PAYMENT_STATUS_VARIANTS: Record<string, "success" | "warning" | "danger" | "info" | "default"> = {
  paid: "success",
  pending: "warning",
  failed: "danger",
  refunded: "info",
};

/**
 * Payment status filter options (shared across pages)
 */
export const PAYMENT_STATUS_OPTIONS = [
  { value: "", label: "All Payment Status" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

/**
 * Default placeholder image for missing product/category images
 */
export const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50'%3E%3Crect width='50' height='50' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='10'%3ENo img%3C/text%3E%3C/svg%3E";
