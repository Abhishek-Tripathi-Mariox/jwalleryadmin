import React, { useState, useEffect } from "react";
import { Search, Eye, Filter, CheckCircle2, Package, Truck, Home, XCircle, Save } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Table } from "../../components/ui/Table";
import { Pagination } from "../../components/ui/Pagination";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { useToast } from "../../store/toastStore";
import {
  orderService,
  ORDER_STATUS_MAP,
  ORDER_STATUS_COLORS,
  ORDER_TRACK_FLOW,
} from "../../services/orderService";
import { formatCurrency, PAYMENT_STATUS_OPTIONS, PLACEHOLDER_IMAGE } from "../../lib/utils";
import type { Order, OrderStatus } from "../../types";

const STEP_ICONS: Record<number, React.ElementType> = {
  1: CheckCircle2,
  2: Package,
  3: Truck,
  4: Home,
};

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  // View order state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  // Pending status edit — separate from selectedOrder.status so the admin can
  // pick a value and then explicitly hit Update (mirrors how shipped/cancelled
  // are not accidental clicks).
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);

  // Reset pending status whenever the modal opens for a new order.
  useEffect(() => {
    setPendingStatus(selectedOrder ? (selectedOrder.status as OrderStatus) : null);
  }, [selectedOrder?._id, selectedOrder?.status]);

  const toast = useToast();

  useEffect(() => {
    fetchOrders();
  }, [page, search, statusFilter, paymentFilter]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const status = statusFilter ? (parseInt(statusFilter) as OrderStatus) : undefined;
      const res = await orderService.getOrders(page, limit, status, paymentFilter || undefined);
      if (res.code === 1) {
        setOrders(res.data.orders);
        setTotal(res.data.total);
      }
    } catch (error) {
      toast.error("Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (
    orderId: string,
    newStatus: OrderStatus,
  ) => {
    setIsUpdatingStatus(true);
    try {
      const res = await orderService.updateOrderStatus(orderId, newStatus);
      toast.success("Order status updated successfully!");
      // Keep the modal open so the admin sees the tracker advance, but refresh
      // the data so totals/list reflect the change.
      if (res?.data) {
        setSelectedOrder((prev) => (prev ? { ...prev, ...res.data } : prev));
      }
      fetchOrders();
    } catch (error) {
      toast.error("Failed to update order status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };



  const columns = [
    {
      key: "orderId",
      header: "Order ID",
      render: (order: Order) => (
        <span className="font-medium text-gray-900">{order.orderId}</span>
      ),
    },
    {
      key: "products",
      header: "Products",
      render: (order: Order) => (
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {order.products.slice(0, 3).map((product, i) => (
              <img
                key={i}
                src={product.productImage || PLACEHOLDER_IMAGE}
                alt={product.productName}
                className="w-8 h-8 rounded-full border-2 border-white object-cover bg-gray-100"
              />
            ))}
          </div>
          <span className="text-sm text-gray-500">
            {order.products.length} item{order.products.length > 1 ? "s" : ""}
          </span>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (order: Order) => (
        <span className="font-medium">{formatCurrency(order.grandTotal)}</span>
      ),
    },
    {
      key: "payment",
      header: "Payment",
      render: (order: Order) => (
        <div className="flex items-center gap-2">
          <Badge
            variant={
              order.paymentStatus === "paid"
                ? "success"
                : order.paymentStatus === "failed"
                  ? "danger"
                  : "warning"
            }
          >
            {order.paymentStatus.toUpperCase()}
          </Badge>
          <span className="text-xs text-gray-500 uppercase">
            {order.paymentMode}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (order: Order) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${ORDER_STATUS_COLORS[order.status as OrderStatus]}`}
        >
          {ORDER_STATUS_MAP[order.status as OrderStatus]}
        </span>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (order: Order) => (
        <span className="text-sm text-gray-500">
          {new Date(order.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (order: Order) => (
        <div className="flex justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedOrder(order);
              setIsViewModalOpen(true);
            }}
            className="p-1.5 rounded-md text-gray-500 hover:text-[#B8860B] hover:bg-gray-100 transition-colors"
            title="View Details"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  const statusOptions = [
    { value: "", label: "All Status" },
    ...Object.entries(ORDER_STATUS_MAP).map(([value, label]) => ({ value, label })),
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 mt-1">Manage and track customer orders</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by order ID..."
              leftIcon={<Search className="w-5 h-5" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            leftIcon={<Filter className="w-4 h-4" />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
            <Select
              label="Order Status"
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
            <Select
              label="Payment Status"
              options={PAYMENT_STATUS_OPTIONS}
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
            />
            <div className="flex items-end">
              <Button
                variant="ghost"
                onClick={() => {
                  setStatusFilter("");
                  setPaymentFilter("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text="Loading orders..." />
        </div>
      ) : (
        <>
          <Table
            columns={columns}
            data={orders}
            emptyMessage="No orders found"
          />
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(total / limit)}
            onPageChange={setPage}
            totalItems={total}
            itemsPerPage={limit}
          />
        </>
      )}

      {/* View Order Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`Order: ${selectedOrder?.orderId}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Status + Tracker */}
            <div className="p-4 bg-gray-50 rounded-lg space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-sm text-gray-500">Current Status</p>
                  <span
                    className={`inline-flex px-3 py-1 text-sm font-medium rounded-full mt-1 ${ORDER_STATUS_COLORS[selectedOrder.status as OrderStatus]}`}
                  >
                    {ORDER_STATUS_MAP[selectedOrder.status as OrderStatus]}
                  </span>
                </div>
                <div className="flex items-end gap-2">
                  <Select
                    label="Change to"
                    options={statusOptions.filter((s) => s.value !== "")}
                    value={(pendingStatus ?? selectedOrder.status).toString()}
                    onChange={(e) =>
                      setPendingStatus(parseInt(e.target.value) as OrderStatus)
                    }
                    disabled={isUpdatingStatus || selectedOrder.status === 5}
                  />
                  <Button
                    onClick={() =>
                      pendingStatus &&
                      handleUpdateStatus(selectedOrder._id, pendingStatus)
                    }
                    isLoading={isUpdatingStatus}
                    disabled={
                      isUpdatingStatus ||
                      selectedOrder.status === 5 ||
                      pendingStatus == null ||
                      pendingStatus === selectedOrder.status
                    }
                    leftIcon={<Save className="w-4 h-4" />}
                  >
                    Update
                  </Button>
                </div>
              </div>

              {/* Visual tracker */}
              {selectedOrder.status === 5 ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm">
                  <XCircle className="w-4 h-4" /> Order cancelled.
                </div>
              ) : (
                <div className="flex items-center">
                  {ORDER_TRACK_FLOW.map((step, idx) => {
                    const reached = (selectedOrder.status as number) >= step;
                    const current = selectedOrder.status === step;
                    const Icon = STEP_ICONS[step] || CheckCircle2;
                    return (
                      <React.Fragment key={step}>
                        <div className="flex flex-col items-center shrink-0">
                          <div
                            className={`w-10 h-10 rounded-full grid place-items-center border-2 ${
                              reached
                                ? "bg-[#B8860B] border-[#B8860B] text-white"
                                : "bg-white border-gray-200 text-gray-300"
                            } ${current ? "ring-4 ring-[#B8860B]/20" : ""}`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span
                            className={`mt-1 text-xs font-medium whitespace-nowrap ${
                              reached ? "text-gray-900" : "text-gray-400"
                            }`}
                          >
                            {ORDER_STATUS_MAP[step]}
                          </span>
                        </div>
                        {idx < ORDER_TRACK_FLOW.length - 1 && (
                          <div
                            className={`flex-1 h-0.5 mx-2 ${
                              (selectedOrder.status as number) > step
                                ? "bg-[#B8860B]"
                                : "bg-gray-200"
                            }`}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}

              <p className="text-xs text-gray-400">
                Last updated{" "}
                {new Date(selectedOrder.updatedAt || selectedOrder.createdAt).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                })}
              </p>
            </div>

            {/* Products */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Products</h4>
              <div className="space-y-3">
                {selectedOrder.products.map((product, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={
                          product.productImage ||
                          PLACEHOLDER_IMAGE
                        }
                        alt={product.productName}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {product.productName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {product.size && `Size: ${product.size}`}
                          {product.size && product.color && " | "}
                          {product.color && `Color: ${product.color}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(product.totalPrice)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Qty: {product.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span>
                    {selectedOrder.shippingCost > 0
                      ? formatCurrency(selectedOrder.shippingCost)
                      : "FREE"}
                  </span>
                </div>
                {(selectedOrder.platformFee || 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Platform fee</span>
                    <span>{formatCurrency(selectedOrder.platformFee || 0)}</span>
                  </div>
                )}
                {selectedOrder.couponDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Coupon Discount</span>
                    <span>-{formatCurrency(selectedOrder.couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(selectedOrder.grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Payment Mode</p>
                  <p className="font-medium uppercase">
                    {selectedOrder.paymentMode}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Payment Status</p>
                  <Badge
                    variant={
                      selectedOrder.paymentStatus === "paid"
                        ? "success"
                        : selectedOrder.paymentStatus === "failed"
                          ? "danger"
                          : "warning"
                    }
                  >
                    {selectedOrder.paymentStatus.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Order Date</p>
                  <p className="font-medium">
                    {new Date(selectedOrder.createdAt).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      },
                    )}
                  </p>
                </div>
                {selectedOrder.razorpayPaymentId && (
                  <div>
                    <p className="text-xs text-gray-500">Payment ID</p>
                    <p className="font-medium text-sm">
                      {selectedOrder.razorpayPaymentId}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="ghost" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
