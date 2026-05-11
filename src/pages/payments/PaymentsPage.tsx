import React, { useState, useEffect } from "react";
import {
  Search,
  Eye,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Table } from "../../components/ui/Table";
import { Pagination } from "../../components/ui/Pagination";
import { Badge } from "../../components/ui/Badge";
import { StatCard } from "../../components/ui/StatCard";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { useToast } from "../../store/toastStore";
import { paymentService } from "../../services/dashboardService";
import { formatCurrency, PAYMENT_STATUS_VARIANTS, PAYMENT_STATUS_OPTIONS } from "../../lib/utils";
import type { Payment } from "../../types";

export const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);

  // Stats
  const [stats, setStats] = useState({
    totalAmount: 0,
    totalTransactions: 0,
    successfulPayments: 0,
    pendingPayments: 0,
    failedPayments: 0,
  });

  // View payment state
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const toast = useToast();

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, [page, search, statusFilter]);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const res = await paymentService.getPayments(page, limit, statusFilter || undefined);
      if (res.code === 1) {
        setPayments(res.data.payments.map((p: any) => ({
          _id: p._id,
          orderId: p.orderId,
          userId: typeof p.userId === 'object' ? p.userId._id : p.userId,
          amount: p.grandTotal,
          currency: "INR",
          status: p.paymentStatus,
          paymentMode: p.paymentMode,
          razorpayOrderId: p.razorpayOrderId,
          razorpayPaymentId: p.razorpayPaymentId,
          createdAt: p.createdAt,
          updatedAt: p.paidAt || p.createdAt,
        })));
        setTotal(res.data.total);
      }
    } catch (error) {
      toast.error("Failed to fetch payments");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await paymentService.getPaymentStats();
      if (res.code === 1) {
        const data = res.data as any;
        setStats({
          totalAmount: (data.paid?.amount || 0) + (data.pending?.amount || 0),
          totalTransactions: (data.paid?.count || 0) + (data.pending?.count || 0) + (data.refunded?.count || 0),
          successfulPayments: data.paid?.count || 0,
          pendingPayments: data.pending?.count || 0,
          failedPayments: data.refunded?.count || 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch payment stats:", error);
    }
  };



  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={PAYMENT_STATUS_VARIANTS[status] || "default"}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const columns = [
    {
      key: "orderId",
      header: "Order ID",
      render: (payment: Payment) => (
        <span className="font-medium text-gray-900">{payment.orderId}</span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (payment: Payment) => (
        <span className="font-medium">{formatCurrency(payment.amount)}</span>
      ),
    },
    {
      key: "paymentMode",
      header: "Method",
      render: (payment: Payment) => (
        <span className="uppercase text-sm">{payment.paymentMode}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (payment: Payment) => getStatusBadge(payment.status),
    },
    {
      key: "paymentId",
      header: "Payment ID",
      render: (payment: Payment) => (
        <span className="text-sm text-gray-500">
          {payment.razorpayPaymentId || "-"}
        </span>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (payment: Payment) => (
        <span className="text-sm text-gray-500">
          {new Date(payment.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (payment: Payment) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPayment(payment);
            setIsViewModalOpen(true);
          }}
          className="p-1 text-gray-500 hover:text-blue-600"
          title="View Details"
        >
          <Eye className="w-5 h-5" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-500 mt-1">
          Track and manage payment transactions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalAmount)}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Successful"
          value={stats.successfulPayments}
          icon={CheckCircle}
          color="blue"
        />
        <StatCard
          title="Pending"
          value={stats.pendingPayments}
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Failed"
          value={stats.failedPayments}
          icon={XCircle}
          color="red"
        />
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by order ID or payment ID..."
              leftIcon={<Search className="w-5 h-5" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              options={PAYMENT_STATUS_OPTIONS}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text="Loading payments..." />
        </div>
      ) : (
        <>
          <Table
            columns={columns}
            data={payments}
            emptyMessage="No payments found"
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

      {/* View Payment Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Payment Details"
        size="md"
      >
        {selectedPayment && (
          <div className="space-y-6">
            {/* Status Header */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <div className="mt-1">
                  {getStatusBadge(selectedPayment.status)}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(selectedPayment.amount)}
                </p>
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Order ID</p>
                  <p className="font-medium">{selectedPayment.orderId}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Payment Method</p>
                  <p className="font-medium uppercase">
                    {selectedPayment.paymentMode}
                  </p>
                </div>
              </div>

              {selectedPayment.razorpayOrderId && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Razorpay Order ID</p>
                  <p className="font-medium text-sm">
                    {selectedPayment.razorpayOrderId}
                  </p>
                </div>
              )}

              {selectedPayment.razorpayPaymentId && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Razorpay Payment ID</p>
                  <p className="font-medium text-sm">
                    {selectedPayment.razorpayPaymentId}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Created At</p>
                  <p className="font-medium text-sm">
                    {new Date(selectedPayment.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Updated At</p>
                  <p className="font-medium text-sm">
                    {new Date(selectedPayment.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="ghost" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
              {selectedPayment.status === "paid" && (
                <Button variant="danger">Initiate Refund</Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
