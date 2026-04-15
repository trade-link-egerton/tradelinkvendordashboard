import React, { useEffect, useMemo, useState } from 'react';
import { Download, Calendar } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { toast } from 'sonner';
import { getOrdersReport, getProductsReport, getRevenueSeries } from '../lib/vendorApi';

interface SalesRow {
  name: string;
  sales: number;
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function Reports() {
  const [dateRange, setDateRange] = useState('7d');
  const [salesData, setSalesData] = useState<SalesRow[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [avgOrderValue, setAvgOrderValue] = useState(0);
  const [topCategory, setTopCategory] = useState('N/A');

  useEffect(() => {
    const loadReports = async () => {
      try {
        const rangeParam: Record<string, string> = { range: dateRange };

        const [revenue, ordersReport, productsReport] = await Promise.all([
          getRevenueSeries(rangeParam),
          getOrdersReport(rangeParam),
          getProductsReport(rangeParam)
        ]);

        const mappedRevenue = revenue.map((point) => ({ name: point.label, sales: point.value }));
        const totalRevenueFromSeries = mappedRevenue.reduce((sum, row) => sum + row.sales, 0);

        const orders = toNumber(ordersReport.total_orders || ordersReport.orders || 0);

        setSalesData(mappedRevenue);
        setTotalSales(totalRevenueFromSeries);
        setTotalOrders(orders);
        setAvgOrderValue(orders > 0 ? totalRevenueFromSeries / orders : 0);
        setTopCategory(String(productsReport.top_category || productsReport.best_category || 'N/A'));
      } catch {
        toast.error('Failed to load reports.');
      }
    };

    void loadReports();
  }, [dateRange]);

  const performanceLabel = useMemo(() => {
    if (salesData.length < 2) return 'Not enough data yet';

    const first = salesData[0].sales;
    const last = salesData[salesData.length - 1].sales;
    if (first === 0) return 'Trend not available';

    const change = ((last - first) / first) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}% over selected range`;
  }, [salesData]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)]">Reports & Analytics</h1>
          <p className="text-[var(--text-secondary)]">Detailed insights into your store&apos;s performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
              size={16}
            />
            <select
              className="input-field pl-9 py-2 bg-[var(--bg-primary)]"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
          <button className="btn-secondary" disabled>
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <p className="text-sm font-medium text-[var(--text-secondary)] mb-1">Total Sales</p>
          <h3 className="text-2xl font-bold font-mono text-[var(--text-primary)]">KES {totalSales.toLocaleString()}</h3>
          <p className="text-sm text-[var(--text-secondary)] mt-2">{performanceLabel}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm font-medium text-[var(--text-secondary)] mb-1">Total Orders</p>
          <h3 className="text-2xl font-bold font-mono text-[var(--text-primary)]">{totalOrders}</h3>
          <p className="text-sm text-[var(--text-secondary)] mt-2">From backend orders report</p>
        </div>
        <div className="card p-5">
          <p className="text-sm font-medium text-[var(--text-secondary)] mb-1">Average Order Value</p>
          <h3 className="text-2xl font-bold font-mono text-[var(--text-primary)]">KES {avgOrderValue.toLocaleString()}</h3>
          <p className="text-sm text-[var(--text-secondary)] mt-2">Calculated from sales and orders</p>
        </div>
        <div className="card p-5">
          <p className="text-sm font-medium text-[var(--text-secondary)] mb-1">Top Category</p>
          <h3 className="text-2xl font-bold text-[var(--text-primary)]">{topCategory}</h3>
          <p className="text-sm text-[var(--text-secondary)] mt-2">Based on products report</p>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">Sales Volume</h2>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)' }} />
              <Tooltip
                cursor={{ fill: 'var(--bg-secondary)' }}
                contentStyle={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-color)',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="sales" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
