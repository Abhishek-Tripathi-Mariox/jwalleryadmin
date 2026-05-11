import React, { useEffect, useState } from "react";
import {
  ShoppingCart,
  DollarSign,
  Users,
  Package,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { StatCard } from "../../components/ui/StatCard";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { Badge } from "../../components/ui/Badge";
import { dashboardService } from "../../services/dashboardService";
import {
  ORDER_STATUS_MAP,
  ORDER_STATUS_COLORS,
} from "../../services/orderService";
import { formatCurrency, PAYMENT_STATUS_VARIANTS } from "../../lib/utils";
import type { DashboardStats, Order, OrderStatus } from "../../types";

interface Trends {
  revenue: number;
  orders: number;
  users: number;
  products: number;
}

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trends, setTrends] = useState<Trends>({ revenue: 0, orders: 0, users: 0, products: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [salesPeriod, setSalesPeriod] = useState<"week" | "month" | "year">("month");
  const [salesChart, setSalesChart] = useState<{ labels: string[]; data: number[] }>({ labels: [], data: [] });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchSalesChart();
  }, [salesPeriod]);

  const fetchSalesChart = async () => {
    try {
      const res = await dashboardService.getSalesChart(salesPeriod);
      if (res.code === 1) {
        setSalesChart(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch sales chart:", error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentOrders(),
      ]);

      if (statsRes.code === 1) {
        const d = statsRes.data as any;
        setStats({
          totalOrders: d.totalOrders ?? 0,
          totalRevenue: d.totalRevenue ?? 0,
          totalUsers: d.totalUsers ?? 0,
          totalProducts: d.totalProducts ?? 0,
          pendingOrders: d.pendingOrders ?? 0,
          monthlyRevenue: d.monthlyRevenue ?? 0,
        });
        if (d.trends) {
          setTrends(d.trends);
        }
      }

      if (ordersRes.code === 1 && ordersRes.data.orders) {
        setRecentOrders(ordersRes.data.orders);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };



  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenue || 0)}
          icon={DollarSign}
          color="green"
          trend={{ value: Math.abs(trends.revenue), isPositive: trends.revenue >= 0 }}
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders?.toLocaleString() || "0"}
          icon={ShoppingCart}
          color="blue"
          trend={{ value: Math.abs(trends.orders), isPositive: trends.orders >= 0 }}
        />
        <StatCard
          title="Total Users"
          value={stats?.totalUsers?.toLocaleString() || "0"}
          icon={Users}
          color="purple"
          trend={{ value: Math.abs(trends.users), isPositive: trends.users >= 0 }}
        />
        <StatCard
          title="Total Products"
          value={stats?.totalProducts?.toLocaleString() || "0"}
          icon={Package}
          color="amber"
          trend={{ value: Math.abs(trends.products), isPositive: trends.products >= 0 }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Sales Overview
            </h2>
            <select
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#B8860B]"
              value={salesPeriod}
              onChange={(e) => setSalesPeriod(e.target.value as "week" | "month" | "year")}
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
          {salesChart.labels.length > 0 ? (
            <div className="h-64 flex items-end space-x-1 px-2">
              {salesChart.data.map((value, idx) => {
                const maxVal = Math.max(...salesChart.data, 1);
                const height = (value / maxVal) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                    <div
                      className="w-full bg-[#B8860B] rounded-t-sm min-h-0.5 hover:bg-[#996515] transition-colors"
                      style={{ height: `${Math.max(height, 1)}%` }}
                      title={`${salesChart.labels[idx]}: ${formatCurrency(value)}`}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
              <div className="text-center text-gray-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-2" />
                <p>No sales data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Quick Stats
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#fdf8ec] rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-[#B8860B]">
                  {stats?.pendingOrders || 0}
                </p>
              </div>
              <div className="p-3 bg-[#f8d7e0] rounded-full">
                <ShoppingCart className="w-6 h-6 text-[#B8860B]" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats?.monthlyRevenue || 0)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <ArrowUpRight className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats?.totalUsers
                    ? ((stats?.totalOrders || 0) / stats.totalUsers * 100).toFixed(1)
                    : "0"}%
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Orders
            </h2>
            <a
              href="/orders"
              className="text-sm text-[#B8860B] hover:text-[#996515] font-medium"
            >
              View all →
            </a>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.orderId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(order.grandTotal)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      variant={
                        PAYMENT_STATUS_VARIANTS[order.paymentStatus] || "default"
                      }
                    >
                      {order.paymentStatus.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${ORDER_STATUS_COLORS[order.status as OrderStatus]}`}
                    >
                      {ORDER_STATUS_MAP[order.status as OrderStatus]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
