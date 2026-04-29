import React, { useEffect, useMemo, useState } from 'react';
import { getVendorSession } from '../lib/session';
import { Link } from 'react-router-dom';
import {
  Banknote,
  ShoppingBag,
  Truck,
  Calculator,
  Plus,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { toast } from 'sonner';
import { KPICard } from '../components/shared/KPICard';
import { StatusBadge } from '../components/shared/StatusBadge';
import {
  DashboardSummary,
  getDashboardSummary,
  getLowStock,
  getRevenueSeries
} from '../lib/vendorApi';

type ChartPeriod = 'day' | 'week' | 'month';

interface ChartRow {
  name: string;
  value: number;
}

const EMPTY_SUMMARY: DashboardSummary = {
  revenueToday: 0,
  ordersToday: 0,
  pendingOrders: 0,
  lowStockCount: 0,
  topProducts: [],
  recentOrders: []
};

function toNumber(value: unknown): number {
  if (typeof value === 'number') {
    return value;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toOrderStatus(status: unknown): string {
  if (typeof status !== 'string') {
    return 'Pending';
  }

  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

export function Dashboard() {
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('week');
  const [summary, setSummary] = useState<DashboardSummary>(EMPTY_SUMMARY);
  const [revenueData, setRevenueData] = useState<ChartRow[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Array<Record<string, unknown>>>([]);
  const [isLoading, setIsLoading] = useState(true);
const session = getVendorSession();
  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);

      try {
        const periodMap: Record<ChartPeriod, string> = {
          day: 'today',
          week: '7d',
          month: '30d'
        };

        const [summaryResponse, lowStockResponse, revenueResponse] = await Promise.all([
          getDashboardSummary(),
          getLowStock(),
          getRevenueSeries({ range: periodMap[chartPeriod] })
        ]);

        setSummary(summaryResponse || EMPTY_SUMMARY);
        // setLowStockItems(lowStockResponse);
        setRevenueData(
          revenueResponse.length > 0
            ? revenueResponse.map((point) => ({ name: point.label, value: point.value }))
            : [{ name: 'Today', value: toNumber(summaryResponse?.revenueToday) }]
        );
      } catch {
        toast.error('Failed to load dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboard();
  }, [chartPeriod]);

  const avgOrderValue = useMemo(() => {
    if (!summary.ordersToday) {
      return 0;
    }

    return summary.revenueToday / summary.ordersToday;
  }, [summary.ordersToday, summary.revenueToday]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)]">
            Dashboard Overview
          </h1>
<p className="text-[var(--text-secondary)]">
  Welcome back, {session.vendorName || 'Vendor'} 👋 — here&apos;s what&apos;s happening with {session.storeName || 'your store'} today.
</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/products/new" className="btn-primary">
            <Plus size={18} /> Add Product
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KPICard title="Revenue Today" value={`KES ${toNumber(summary.revenueToday).toLocaleString()}`} icon={Banknote} />
        <KPICard title="Orders Today" value={String(toNumber(summary.ordersToday))} icon={ShoppingBag} />
        <KPICard title="Pending Orders" value={String(toNumber(summary.pendingOrders))} icon={Truck} />
        <KPICard title="Avg. Order Value" value={`KES ${avgOrderValue.toLocaleString()}`} icon={Calculator} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Revenue Overview</h2>
            <div className="flex bg-[var(--bg-secondary)] p-1 rounded-lg border border-[var(--border-color)]">
              {(['day', 'week', 'month'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setChartPeriod(period)}
                  className={`px-3 py-1 text-sm font-medium rounded-md capitalize transition-colors ${
                    chartPeriod === period
                      ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                  tickFormatter={(value) => `K${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--border-color)',
                    borderRadius: '8px'
                  }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                  formatter={(value: number) => [`KES ${value.toLocaleString()}`, 'Revenue']}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#1d4ed8"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#1d4ed8', strokeWidth: 2, stroke: 'var(--bg-primary)' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-0 flex flex-col">
          <div className="p-5 border-b border-[var(--border-color)] flex items-center gap-2">
            <AlertTriangle className="text-warning-500" size={20} />
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Low Stock Alerts</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {lowStockItems.length === 0 && !isLoading ? (
              <p className="text-sm text-[var(--text-secondary)] p-4">No low-stock products right now.</p>
            ) : (
              lowStockItems.map((item, i) => {
                const name = String(item.name || item.product_name || `Item ${i + 1}`);
                const stock = toNumber(item.stock_quantity ?? item.stock ?? 0);
                const threshold = toNumber(item.threshold ?? 5);
                return (
                  <div
                    key={`${name}-${i}`}
                    className="flex items-center justify-between p-3 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate max-w-[180px]">{name}</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">Threshold: {threshold}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center justify-center px-2 py-1 rounded text-xs font-bold font-mono ${
                          stock === 0
                            ? 'bg-destructive-100 text-destructive-700 dark:bg-destructive-900/30 dark:text-destructive-400'
                            : 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400'
                        }`}
                      >
                        {stock} left
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="p-4 border-t border-[var(--border-color)] mt-auto">
            <Link to="/products" className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center justify-center gap-1">
              Manage Inventory <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-5 border-b border-[var(--border-color)] flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Recent Orders</h2>
          <Link to="/orders" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[var(--text-secondary)] uppercase bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
              <tr>
                <th className="px-5 py-3 font-medium">Order ID</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Items</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {summary.recentOrders.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-center text-[var(--text-secondary)]">
                    No recent orders yet.
                  </td>
                </tr>
              ) : (
                summary.recentOrders.map((order, i) => {
                  const id = String(order.id || order.order_id || i + 1);
                  const customer = String(order.customer_name || order.customer || 'Customer');
                  const items = toNumber(order.items_count || order.items || 0);
                  const total = toNumber(order.total_amount || order.total || 0);
                  const dateRaw = order.created_at || order.date;
                  const status = toOrderStatus(order.status);
                  return (
                    <tr
                      key={id}
                      className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-secondary)]/50 transition-colors"
                    >
                      <td className="px-5 py-3 font-mono font-medium text-[var(--text-primary)]">#{id}</td>
                      <td className="px-5 py-3 text-[var(--text-primary)]">{customer}</td>
                      <td className="px-5 py-3 text-[var(--text-secondary)]">{items}</td>
                      <td className="px-5 py-3 font-mono text-[var(--text-primary)]">KES {total.toLocaleString()}</td>
                      <td className="px-5 py-3 text-[var(--text-secondary)]">
                        {typeof dateRaw === 'string' ? new Date(dateRaw).toLocaleString() : '-'}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge
                          status={status}
                          variant={
                            status === 'Delivered'
                              ? 'success'
                              : status === 'Cancelled'
                                ? 'destructive'
                                : status === 'Pending'
                                  ? 'warning'
                                  : 'info'
                          }
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
