import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import {
  Download,
  Calendar,
  TrendingUp,
  Package,
  BarChart2,
  Archive,
  RefreshCw,
  Wallet,
  ArrowDownCircle,
  Star,
  Truck,
  Receipt,
  Search,
  ChevronDown,
  CheckCircle2,
  Clock,
  XCircle,
  Filter,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { toast } from 'sonner';
import {
  getOrdersReport,
  getProductsReport,
  getRevenueSeries,
} from '../lib/vendorApi';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SalesRow {
  name: string;
  sales: number;
}

type ReportId =
  | 'sales'
  | 'orders'
  | 'products'
  | 'inventory'
  | 'movements'
  | 'earnings'
  | 'payouts'
  | 'reviews'
  | 'shipments'
  | 'suborders';

interface NavReport {
  id: ReportId;
  label: string;
  icon: React.ReactNode;
  group: string;
  color: string;
  bgColor: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function fmt(n: number) {
  return n.toLocaleString('en-KE', { maximumFractionDigits: 0 });
}

function fmtKES(n: number) {
  return `KES ${fmt(n)}`;
}

interface ExportSummaryItem {
  label: string;
  value: string;
}

interface ReportExportPayload {
  title: string;
  description?: string;
  summary?: ExportSummaryItem[];
  columns?: string[];
  rows?: Record<string, string>[];
}

interface ReportExportProps {
  onExportChange: (payload: ReportExportPayload) => void;
}

function csvEscape(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-') || 'report';
}

function downloadTextFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function buildCsvContent(payload: ReportExportPayload): string {
  const lines: string[] = [];
  lines.push(`Report,${csvEscape(payload.title)}`);

  if (payload.description) {
    lines.push(`Description,${csvEscape(payload.description)}`);
  }

  if (payload.summary?.length) {
    lines.push('');
    lines.push('Summary');
    lines.push('Label,Value');
    payload.summary.forEach((item) => {
      lines.push(`${csvEscape(item.label)},${csvEscape(item.value)}`);
    });
  }

  if (payload.columns?.length && payload.rows?.length) {
    lines.push('');
    lines.push('Data');
    lines.push(payload.columns.map(csvEscape).join(','));
    payload.rows.forEach((row) => {
      lines.push(payload.columns!.map((column) => csvEscape(row[column] ?? '—')).join(','));
    });
  }

  return lines.join('\r\n');
}

function buildPdfContent(payload: ReportExportPayload) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const maxWidth = pageWidth - margin * 2;
  let y = 48;

  const ensureSpace = (lineCount: number, fontSize: number) => {
    const neededHeight = lineCount * (fontSize + 4);
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const writeText = (text: string, fontSize: number, fontStyle: 'normal' | 'bold' = 'normal') => {
    doc.setFont('helvetica', fontStyle);
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth) as string[];
    ensureSpace(lines.length, fontSize);
    doc.text(lines, margin, y);
    y += lines.length * (fontSize + 4);
  };

  writeText(payload.title, 18, 'bold');

  if (payload.description) {
    y += 4;
    writeText(payload.description, 11);
  }

  if (payload.summary?.length) {
    y += 8;
    writeText('Summary', 13, 'bold');
    payload.summary.forEach((item) => {
      writeText(`${item.label}: ${item.value}`, 11);
    });
  }

  if (payload.columns?.length && payload.rows?.length) {
    y += 8;
    writeText('Data', 13, 'bold');
    writeText(payload.columns.join(' | '), 10, 'bold');
    payload.rows.forEach((row) => {
      writeText(payload.columns!.map((column) => row[column] ?? '—').join(' | '), 10);
    });
  }

  return doc;
}

function buildFallbackExportPayload(title: string, description: string): ReportExportPayload {
  return {
    title,
    description,
    summary: [
      { label: 'Status', value: 'No export data is available yet for this report.' },
      { label: 'Tip', value: 'Open a populated report section and try again.' },
    ],
  };
}

// ─── Navigation config ────────────────────────────────────────────────────────

const NAV_REPORTS: NavReport[] = [
  // Core
  { id: 'sales',     label: 'Sales overview',       icon: <TrendingUp size={14} />,       group: 'Core',      color: '#0F6E56', bgColor: '#E1F5EE' },
  { id: 'suborders', label: 'Suborders',             icon: <Receipt size={14} />,          group: 'Core',      color: '#0F6E56', bgColor: '#E1F5EE' },
  // Inventory
  { id: 'inventory', label: 'Stock levels',          icon: <Archive size={14} />,          group: 'Inventory', color: '#3B6D11', bgColor: '#EAF3DE' },
  { id: 'movements', label: 'Stock movements',       icon: <RefreshCw size={14} />,        group: 'Inventory', color: '#3B6D11', bgColor: '#EAF3DE' },
  // Operations
  { id: 'orders',    label: 'Orders',                icon: <Package size={14} />,          group: 'Operations',color: '#185FA5', bgColor: '#E6F1FB' },
  { id: 'shipments', label: 'Shipments',             icon: <Truck size={14} />,            group: 'Operations',color: '#185FA5', bgColor: '#E6F1FB' },
  // Finance
  { id: 'earnings',  label: 'Earnings',              icon: <Wallet size={14} />,           group: 'Finance',   color: '#BA7517', bgColor: '#FAEEDA' },
  { id: 'payouts',   label: 'Payouts',               icon: <ArrowDownCircle size={14} />,  group: 'Finance',   color: '#BA7517', bgColor: '#FAEEDA' },
  // Product
  { id: 'products',  label: 'Product performance',   icon: <BarChart2 size={14} />,        group: 'Product',   color: '#534AB7', bgColor: '#EEEDFE' },
  { id: 'reviews',   label: 'Reviews',               icon: <Star size={14} />,             group: 'Product',   color: '#534AB7', bgColor: '#EEEDFE' },
];

const GROUP_ORDER = ['Core', 'Inventory', 'Operations', 'Finance', 'Product'];

// ─── Sub-components ──────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: 'positive' | 'negative' | 'neutral';
}) {
  const subColor =
    accent === 'positive'
      ? 'text-emerald-600'
      : accent === 'negative'
      ? 'text-red-500'
      : 'text-[var(--text-secondary)]';

  return (
    <div className="card p-5 flex flex-col gap-1">
      <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold font-mono text-[var(--text-primary)] leading-tight">{value}</p>
      {sub && <p className={`text-xs mt-1 ${subColor}`}>{sub}</p>}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const s = status.toLowerCase();
  const map: Record<string, { icon: React.ReactNode; cls: string }> = {
    delivered:  { icon: <CheckCircle2 size={11} />, cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    completed:  { icon: <CheckCircle2 size={11} />, cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    pending:    { icon: <Clock size={11} />,        cls: 'bg-amber-50  text-amber-700  border-amber-200'  },
    processing: { icon: <Clock size={11} />,        cls: 'bg-blue-50   text-blue-700   border-blue-200'   },
    shipped:    { icon: <Truck size={11} />,        cls: 'bg-blue-50   text-blue-700   border-blue-200'   },
    failed:     { icon: <XCircle size={11} />,      cls: 'bg-red-50    text-red-700    border-red-200'    },
    cancelled:  { icon: <XCircle size={11} />,      cls: 'bg-red-50    text-red-700    border-red-200'    },
    'in transit': { icon: <Truck size={11} />,      cls: 'bg-blue-50   text-blue-700   border-blue-200'   },
  };
  const cfg = map[s] ?? { icon: null, cls: 'bg-gray-50 text-gray-600 border-gray-200' };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${cfg.cls}`}>
      {cfg.icon}
      {status}
    </span>
  );
}

function SectionHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
      <p className="text-sm text-[var(--text-secondary)]">{sub}</p>
    </div>
  );
}

// shared filter bar
function FilterBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] mb-5">
      <Filter size={13} className="text-[var(--text-secondary)]" />
      {children}
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
  icon,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  icon?: React.ReactNode;
}) {
  return (
    <div className="relative">
      {icon && (
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
          {icon}
        </span>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`input-field py-1.5 pr-7 text-sm appearance-none bg-[var(--bg-primary)] ${icon ? 'pl-8' : 'pl-3'}`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-secondary)]" />
    </div>
  );
}

function FilterSearch({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field py-1.5 pl-8 pr-3 text-sm bg-[var(--bg-primary)] w-48"
      />
    </div>
  );
}

// ─── Report views ─────────────────────────────────────────────────────────────

// --- 1. Sales Overview ---
function SalesReport({ onExportChange }: ReportExportProps) {
  const [dateRange, setDateRange] = useState('30d');
  const [statusFilter, setStatusFilter] = useState('all');
  const [granularity, setGranularity] = useState('daily');
  const [salesData, setSalesData] = useState<SalesRow[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [avgOrderValue, setAvgOrderValue] = useState(0);
  const [topCategory, setTopCategory] = useState('N/A');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const load = async () => {
      try {
        const p = { range: dateRange, status: statusFilter, granularity };
        const [revenue, ordersReportRaw, productsReportRaw] = await Promise.all([
          getRevenueSeries({ range: dateRange }),
          getOrdersReport(p),
          getProductsReport(p),
        ]);
        const ordersReport = ordersReportRaw as { total_orders?: unknown; orders?: unknown };
        const productsReport = productsReportRaw as { top_category?: unknown; best_category?: unknown };
        const mapped = revenue.map((pt) => ({ name: pt.label, sales: pt.value }));
        const total = mapped.reduce((s, r) => s + r.sales, 0);
        const orders = toNumber(ordersReport.total_orders || ordersReport.orders || 0);
        setSalesData(mapped);
        setTotalSales(total);
        setTotalOrders(orders);
        setAvgOrderValue(orders > 0 ? total / orders : 0);
        setTopCategory(String(productsReport.top_category || productsReport.best_category || 'N/A'));
      } catch {
        toast.error('Failed to load sales report.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [dateRange, statusFilter, granularity]);

  const performanceLabel = useMemo(() => {
    if (salesData.length < 2) return 'Not enough data yet';
    const first = salesData[0].sales;
    const last = salesData[salesData.length - 1].sales;
    if (first === 0) return 'Trend not available';
    const change = ((last - first) / first) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}% over period`;
  }, [salesData]);

  const trend = useMemo(() => {
    if (salesData.length < 2) return 'neutral';
    const first = salesData[0].sales;
    const last = salesData[salesData.length - 1].sales;
    return last >= first ? 'positive' : 'negative';
  }, [salesData]);

  const exportPayload = useMemo<ReportExportPayload>(() => ({
    title: 'Sales overview',
    description: 'Revenue, orders, and trends for your store',
    summary: [
      { label: 'Date range', value: dateRange },
      { label: 'Status', value: statusFilter },
      { label: 'Granularity', value: granularity },
      { label: 'Total revenue', value: loading ? 'Loading…' : fmtKES(totalSales) },
      { label: 'Total orders', value: loading ? 'Loading…' : fmt(totalOrders) },
      { label: 'Avg. order value', value: loading ? 'Loading…' : fmtKES(avgOrderValue) },
      { label: 'Top category', value: loading ? 'Loading…' : topCategory },
    ],
    columns: ['Period', 'Revenue'],
    rows: salesData.map((row) => ({
      Period: row.name,
      Revenue: fmtKES(row.sales),
    })),
  }), [avgOrderValue, dateRange, granularity, loading, statusFilter, salesData, topCategory, totalOrders, totalSales]);

  useEffect(() => {
    onExportChange(exportPayload);
  }, [exportPayload, onExportChange]);

  return (
    <div>
      <SectionHeader title="Sales overview" sub="Revenue, orders, and trends for your store" />

      <FilterBar>
        <FilterSelect
          value={dateRange}
          onChange={setDateRange}
          icon={<Calendar size={13} />}
          options={[
            { label: 'Today', value: 'today' },
            { label: 'Last 7 days', value: '7d' },
            { label: 'Last 30 days', value: '30d' },
            { label: 'Last 90 days', value: '90d' },
          ]}
        />
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { label: 'All statuses', value: 'all' },
            { label: 'Pending', value: 'pending' },
            { label: 'Processing', value: 'processing' },
            { label: 'Delivered', value: 'delivered' },
            { label: 'Cancelled', value: 'cancelled' },
          ]}
        />
        <FilterSelect
          value={granularity}
          onChange={setGranularity}
          options={[
            { label: 'Hourly', value: 'hourly' },
            { label: 'Daily', value: 'daily' },
            { label: 'Weekly', value: 'weekly' },
            { label: 'Monthly', value: 'monthly' },
          ]}
        />
        {(dateRange !== '30d' || statusFilter !== 'all' || granularity !== 'daily') && (
          <button
            onClick={() => { setDateRange('30d'); setStatusFilter('all'); setGranularity('daily'); }}
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] ml-auto"
          >
            Reset filters
          </button>
        )}
      </FilterBar>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total revenue" value={loading ? '—' : fmtKES(totalSales)} sub={loading ? '' : performanceLabel} accent={trend as 'positive' | 'negative' | 'neutral'} />
        <KpiCard label="Total orders" value={loading ? '—' : fmt(totalOrders)} sub="From orders report" />
        <KpiCard label="Avg. order value" value={loading ? '—' : fmtKES(avgOrderValue)} sub="Revenue ÷ orders" />
        <KpiCard label="Top category" value={loading ? '—' : topCategory} sub="By sales volume" />
      </div>

      <div className="card p-5">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Revenue over time</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0F6E56" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0F6E56" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                cursor={{ fill: 'var(--bg-secondary)' }}
                contentStyle={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', borderRadius: '8px', fontSize: 12 }}
                formatter={(v: number) => [fmtKES(v), 'Revenue']}
              />
              <Area type="monotone" dataKey="sales" stroke="#0F6E56" strokeWidth={2} fill="url(#salesGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// --- 2. Orders Report ---
function OrdersReport({ onExportChange }: ReportExportProps) {
  const [dateRange, setDateRange] = useState('30d');
  const [status, setStatus] = useState('all');
  const [shippingType, setShippingType] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getOrdersReport({ range: dateRange, status, shipping_type: shippingType, sort: sortBy })
      .then((res) => {
        const report = res as { total_orders?: unknown; orders?: Record<string, unknown>[] };
        setTotalOrders(toNumber(report.total_orders ?? 0));
        setData((report.orders as Record<string, unknown>[]) ?? []);
      })
      .catch(() => toast.error('Failed to load orders report.'))
      .finally(() => setLoading(false));
  }, [dateRange, status, shippingType, sortBy]);

  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter((r) =>
      String(r.order_id ?? '').toLowerCase().includes(q) ||
      String(r.product_name ?? '').toLowerCase().includes(q)
    );
  }, [data, search]);

  const exportPayload = useMemo<ReportExportPayload>(() => ({
    title: 'Orders',
    description: 'All orders for your vendor account',
    summary: [
      { label: 'Date range', value: dateRange },
      { label: 'Status', value: status },
      { label: 'Shipping type', value: shippingType },
      { label: 'Sort', value: sortBy },
      { label: 'Total orders', value: loading ? 'Loading…' : fmt(totalOrders) },
      { label: 'Filtered rows', value: loading ? 'Loading…' : fmt(filtered.length) },
    ],
    columns: ['Order ID', 'Date', 'Items', 'Total', 'Shipping', 'Status'],
    rows: filtered.map((row) => ({
      'Order ID': String(row.order_id ?? '—'),
      Date: String(row.order_date ?? row.date ?? '—'),
      Items: String(row.item_count ?? '—'),
      Total: row.total_amount ? fmtKES(toNumber(row.total_amount)) : '—',
      Shipping: String(row.shipping_type ?? '—'),
      Status: String(row.status ?? 'unknown'),
    })),
  }), [dateRange, filtered, loading, shippingType, sortBy, status, totalOrders]);

  useEffect(() => {
    onExportChange(exportPayload);
  }, [exportPayload, onExportChange]);

  return (
    <div>
      <SectionHeader title="Orders" sub="All orders for your vendor account" />
      <FilterBar>
        <FilterSelect value={dateRange} onChange={setDateRange} icon={<Calendar size={13} />}
          options={[{ label: 'Today', value: 'today' }, { label: 'Last 7 days', value: '7d' }, { label: 'Last 30 days', value: '30d' }, { label: 'Last 90 days', value: '90d' }]} />
        <FilterSelect value={status} onChange={setStatus}
          options={[{ label: 'All statuses', value: 'all' }, { label: 'Pending', value: 'pending' }, { label: 'Processing', value: 'processing' }, { label: 'Shipped', value: 'shipped' }, { label: 'Delivered', value: 'delivered' }, { label: 'Cancelled', value: 'cancelled' }]} />
        <FilterSelect value={shippingType} onChange={setShippingType}
          options={[{ label: 'All shipping', value: 'all' }, { label: 'Home delivery', value: 'home' }, { label: 'Pickup station', value: 'pickup' }]} />
        <FilterSelect value={sortBy} onChange={setSortBy}
          options={[{ label: 'Newest first', value: 'date' }, { label: 'Amount: high→low', value: 'amount_desc' }, { label: 'Status', value: 'status' }]} />
        <FilterSearch placeholder="Search order ID or product…" value={search} onChange={setSearch} />
      </FilterBar>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total orders" value={loading ? '—' : fmt(totalOrders)} />
        <KpiCard label="Pending" value={loading ? '—' : fmt(filtered.filter((r) => String(r.status ?? '').toLowerCase() === 'pending').length)} />
        <KpiCard label="Delivered" value={loading ? '—' : fmt(filtered.filter((r) => String(r.status ?? '').toLowerCase() === 'delivered').length)} />
        <KpiCard label="Cancelled" value={loading ? '—' : fmt(filtered.filter((r) => String(r.status ?? '').toLowerCase() === 'cancelled').length)} />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
                {['Order ID', 'Date', 'Items', 'Total', 'Shipping', 'Status'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-10 text-[var(--text-secondary)]">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-[var(--text-secondary)]">No orders found for this filter.</td></tr>
              ) : (
                filtered.map((row, i) => (
                  <tr key={i} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[var(--text-primary)]">#{String(row.order_id ?? '').slice(0, 8)}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{String(row.order_date ?? row.date ?? '—')}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{String(row.item_count ?? '—')}</td>
                    <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{row.total_amount ? fmtKES(toNumber(row.total_amount)) : '—'}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)] capitalize">{String(row.shipping_type ?? '—')}</td>
                    <td className="px-4 py-3"><StatusPill status={String(row.status ?? 'unknown')} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- 3. Product Performance ---
function ProductsReport({ onExportChange }: ReportExportProps) {
  const [dateRange, setDateRange] = useState('30d');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('qty_desc');
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getProductsReport({ range: dateRange, sort: sortBy })
      .then((res) => {
        const report = res as { products?: Record<string, unknown>[] };
        setData((report.products as Record<string, unknown>[]) ?? []);
      })
      .catch(() => toast.error('Failed to load products report.'))
      .finally(() => setLoading(false));
  }, [dateRange, sortBy]);

  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter((r) => String(r.product_name ?? '').toLowerCase().includes(q));
  }, [data, search]);

  const exportPayload = useMemo<ReportExportPayload>(() => ({
    title: 'Product performance',
    description: 'Best and worst selling products',
    summary: [
      { label: 'Date range', value: dateRange },
      { label: 'Sort', value: sortBy },
      { label: 'Filtered rows', value: loading ? 'Loading…' : fmt(filtered.length) },
    ],
    columns: ['Product', 'Qty sold', 'Revenue'],
    rows: filtered.map((row) => ({
      Product: String(row.product_name ?? '—'),
      'Qty sold': fmt(toNumber(row.qty_sold)),
      Revenue: row.revenue ? fmtKES(toNumber(row.revenue)) : '—',
    })),
  }), [dateRange, filtered, loading, sortBy]);

  useEffect(() => {
    onExportChange(exportPayload);
  }, [exportPayload, onExportChange]);

  return (
    <div>
      <SectionHeader title="Product performance" sub="Best and worst selling products" />
      <FilterBar>
        <FilterSelect value={dateRange} onChange={setDateRange} icon={<Calendar size={13} />}
          options={[{ label: 'Last 7 days', value: '7d' }, { label: 'Last 30 days', value: '30d' }, { label: 'Last 90 days', value: '90d' }, { label: 'All time', value: 'all' }]} />
        <FilterSelect value={sortBy} onChange={setSortBy}
          options={[{ label: 'Qty sold: high→low', value: 'qty_desc' }, { label: 'Qty sold: low→high', value: 'qty_asc' }, { label: 'Revenue: high→low', value: 'revenue_desc' }]} />
        <FilterSearch placeholder="Search product…" value={search} onChange={setSearch} />
      </FilterBar>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Top 5 by quantity sold</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filtered.slice(0, 5)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                <YAxis type="category" dataKey="product_name" width={100} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', borderRadius: '8px', fontSize: 12 }} />
                <Bar dataKey="qty_sold" fill="#534AB7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
                  {['Product', 'Qty sold', 'Revenue'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={3} className="text-center py-8 text-[var(--text-secondary)]">Loading…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={3} className="text-center py-8 text-[var(--text-secondary)]">No products found.</td></tr>
                ) : (
                  filtered.map((row, i) => (
                    <tr key={i} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)] transition-colors">
                      <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{String(row.product_name ?? '—')}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{fmt(toNumber(row.qty_sold))}</td>
                      <td className="px-4 py-3 text-[var(--text-primary)]">{row.revenue ? fmtKES(toNumber(row.revenue)) : '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- 4. Inventory / Stock ---
function InventoryReport({ onExportChange }: ReportExportProps) {
  const [stockLevel, setStockLevel] = useState('all');
  const [flashSaleOnly, setFlashSaleOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('qty_asc');

  const exportPayload = useMemo<ReportExportPayload>(() => ({
    title: 'Stock levels',
    description: 'Current inventory and low-stock alerts',
    summary: [
      { label: 'Stock level filter', value: stockLevel },
      { label: 'Sort', value: sortBy },
      { label: 'Search', value: search || 'All products' },
      { label: 'Flash sale only', value: flashSaleOnly ? 'Yes' : 'No' },
      { label: 'Status', value: 'Inventory API not yet connected' },
    ],
  }), [flashSaleOnly, search, sortBy, stockLevel]);

  useEffect(() => {
    onExportChange(exportPayload);
  }, [exportPayload, onExportChange]);

  return (
    <div>
      <SectionHeader title="Stock levels" sub="Current inventory and low-stock alerts" />
      <FilterBar>
        <FilterSelect value={stockLevel} onChange={setStockLevel}
          options={[{ label: 'All levels', value: 'all' }, { label: 'Low stock (<10)', value: 'low' }, { label: 'Out of stock', value: 'out' }, { label: 'Healthy', value: 'healthy' }]} />
        <FilterSelect value={sortBy} onChange={setSortBy}
          options={[{ label: 'Qty: low→high', value: 'qty_asc' }, { label: 'Qty: high→low', value: 'qty_desc' }, { label: 'Last updated', value: 'updated' }, { label: 'Price', value: 'price' }]} />
        <FilterSearch placeholder="Search product…" value={search} onChange={setSearch} />
        <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] ml-auto cursor-pointer select-none">
          <input
            type="checkbox"
            checked={flashSaleOnly}
            onChange={(e) => setFlashSaleOnly(e.target.checked)}
            className="rounded"
          />
          Flash sale only
        </label>
      </FilterBar>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total SKUs" value="—" />
        <KpiCard label="Low stock" value="—" accent="negative" />
        <KpiCard label="Out of stock" value="—" accent="negative" />
        <KpiCard label="Flash sale items" value="—" accent="positive" />
      </div>

      <div className="card p-5 flex flex-col items-center justify-center gap-2 py-16 text-center">
        <Archive size={32} className="text-[var(--text-secondary)] opacity-40" />
        <p className="text-sm font-medium text-[var(--text-primary)]">Connect your inventory API</p>
        <p className="text-xs text-[var(--text-secondary)] max-w-xs">Add a <code className="text-xs bg-[var(--bg-secondary)] px-1 py-0.5 rounded">getStockReport</code> endpoint to <code className="text-xs bg-[var(--bg-secondary)] px-1 py-0.5 rounded">vendorApi.ts</code> querying the <code className="text-xs bg-[var(--bg-secondary)] px-1 py-0.5 rounded">stock</code> table and this view will populate.</p>
      </div>
    </div>
  );
}

// --- 5. Inventory Movements ---
function MovementsReport({ onExportChange }: ReportExportProps) {
  const [dateRange, setDateRange] = useState('30d');
  const [movementType, setMovementType] = useState('all');

  const exportPayload = useMemo<ReportExportPayload>(() => ({
    title: 'Stock movements',
    description: 'Why did stock levels change?',
    summary: [
      { label: 'Date range', value: dateRange },
      { label: 'Movement type', value: movementType },
      { label: 'Status', value: 'Inventory movements API not yet connected' },
    ],
  }), [dateRange, movementType]);

  useEffect(() => {
    onExportChange(exportPayload);
  }, [exportPayload, onExportChange]);

  return (
    <div>
      <SectionHeader title="Stock movements" sub="Why did stock levels change?" />
      <FilterBar>
        <FilterSelect value={dateRange} onChange={setDateRange} icon={<Calendar size={13} />}
          options={[{ label: 'Last 7 days', value: '7d' }, { label: 'Last 30 days', value: '30d' }, { label: 'Last 90 days', value: '90d' }]} />
        <FilterSelect value={movementType} onChange={setMovementType}
          options={[{ label: 'All types', value: 'all' }, { label: 'Stock in', value: 'in' }, { label: 'Stock out (orders)', value: 'order' }, { label: 'Manual adjustment', value: 'manual' }]} />
      </FilterBar>

      <div className="card p-5 flex flex-col items-center justify-center gap-2 py-16 text-center">
        <RefreshCw size={32} className="text-[var(--text-secondary)] opacity-40" />
        <p className="text-sm font-medium text-[var(--text-primary)]">Connect inventory movements API</p>
        <p className="text-xs text-[var(--text-secondary)] max-w-xs">Add a <code className="text-xs bg-[var(--bg-secondary)] px-1 py-0.5 rounded">getInventoryMovements</code> endpoint querying <code className="text-xs bg-[var(--bg-secondary)] px-1 py-0.5 rounded">inventory_movement</code> to display movement history.</p>
      </div>
    </div>
  );
}

// --- 6. Earnings ---
function EarningsReport({ onExportChange }: ReportExportProps) {
  const [dateRange, setDateRange] = useState('30d');

  const exportPayload = useMemo<ReportExportPayload>(() => ({
    title: 'Earnings',
    description: 'Your wallet balance and period earnings',
    summary: [
      { label: 'Date range', value: dateRange },
      { label: 'Status', value: 'Wallet API not yet connected' },
    ],
  }), [dateRange]);

  useEffect(() => {
    onExportChange(exportPayload);
  }, [exportPayload, onExportChange]);

  return (
    <div>
      <SectionHeader title="Earnings" sub="Your wallet balance and period earnings" />
      <FilterBar>
        <FilterSelect value={dateRange} onChange={setDateRange} icon={<Calendar size={13} />}
          options={[{ label: 'Last 30 days', value: '30d' }, { label: 'Last quarter', value: 'quarter' }, { label: 'This year', value: 'year' }, { label: 'All time', value: 'all' }]} />
      </FilterBar>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KpiCard label="Available balance" value="—" sub="In vendor_wallet" accent="positive" />
        <KpiCard label="Pending balance" value="—" sub="Awaiting clearance" />
        <KpiCard label="Period earnings" value="—" sub="From completed orders" accent="positive" />
      </div>

      <div className="card p-5 flex flex-col items-center justify-center gap-2 py-16 text-center">
        <Wallet size={32} className="text-[var(--text-secondary)] opacity-40" />
        <p className="text-sm font-medium text-[var(--text-primary)]">Connect wallet API</p>
        <p className="text-xs text-[var(--text-secondary)] max-w-xs">Add a <code className="text-xs bg-[var(--bg-secondary)] px-1 py-0.5 rounded">getEarningsReport</code> endpoint querying <code className="text-xs bg-[var(--bg-secondary)] px-1 py-0.5 rounded">vendor_wallet</code> and <code className="text-xs bg-[var(--bg-secondary)] px-1 py-0.5 rounded">order_item</code>.</p>
      </div>
    </div>
  );
}

// --- 7. Payouts ---
function PayoutsReport({ onExportChange }: ReportExportProps) {
  const [dateRange, setDateRange] = useState('30d');
  const [payoutStatus, setPayoutStatus] = useState('all');
  const [paymentMethod, setPaymentMethod] = useState('all');

  const exportPayload = useMemo<ReportExportPayload>(() => ({
    title: 'Payouts',
    description: 'Payout history and status',
    summary: [
      { label: 'Date range', value: dateRange },
      { label: 'Payout status', value: payoutStatus },
      { label: 'Payment method', value: paymentMethod },
      { label: 'Status', value: 'Payouts API not yet connected' },
    ],
  }), [dateRange, paymentMethod, payoutStatus]);

  useEffect(() => {
    onExportChange(exportPayload);
  }, [exportPayload, onExportChange]);

  return (
    <div>
      <SectionHeader title="Payouts" sub="Have I been paid? Payout history and status." />
      <FilterBar>
        <FilterSelect value={dateRange} onChange={setDateRange} icon={<Calendar size={13} />}
          options={[{ label: 'Last 30 days', value: '30d' }, { label: 'Last quarter', value: 'quarter' }, { label: 'This year', value: 'year' }, { label: 'Custom', value: 'custom' }]} />
        <FilterSelect value={payoutStatus} onChange={setPayoutStatus}
          options={[{ label: 'All statuses', value: 'all' }, { label: 'Pending', value: 'pending' }, { label: 'Completed', value: 'completed' }, { label: 'Failed', value: 'failed' }]} />
        <FilterSelect value={paymentMethod} onChange={setPaymentMethod}
          options={[{ label: 'All methods', value: 'all' }, { label: 'M-Pesa till', value: 'mpesa_till' }, { label: 'M-Pesa paybill', value: 'mpesa_paybill' }, { label: 'Bank transfer', value: 'bank_transfer' }, { label: 'Mobile money', value: 'mobile_money' }]} />
      </FilterBar>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total paid out" value="—" accent="positive" />
        <KpiCard label="Pending" value="—" />
        <KpiCard label="Failed" value="—" accent="negative" />
        <KpiCard label="Payout count" value="—" />
      </div>

      <div className="card p-5 flex flex-col items-center justify-center gap-2 py-16 text-center">
        <ArrowDownCircle size={32} className="text-[var(--text-secondary)] opacity-40" />
        <p className="text-sm font-medium text-[var(--text-primary)]">Connect payouts API</p>
        <p className="text-xs text-[var(--text-secondary)] max-w-xs">Add a <code className="text-xs bg-[var(--bg-secondary)] px-1 py-0.5 rounded">getPayoutsReport</code> endpoint querying <code className="text-xs bg-[var(--bg-secondary)] px-1 py-0.5 rounded">vendor_payouts</code> and <code className="text-xs bg-[var(--bg-secondary)] px-1 py-0.5 rounded">vendor_payment_channel</code>.</p>
      </div>
    </div>
  );
}

// --- 8. Reviews ---
function ReviewsReport({ onExportChange }: ReportExportProps) {
  const [dateRange, setDateRange] = useState('30d');
  const [rating, setRating] = useState('all');
  const [productSearch, setProductSearch] = useState('');

  const exportPayload = useMemo<ReportExportPayload>(() => ({
    title: 'Product reviews',
    description: 'Customer feedback and ratings',
    summary: [
      { label: 'Date range', value: dateRange },
      { label: 'Rating filter', value: rating },
      { label: 'Search', value: productSearch || 'All products' },
      { label: 'Status', value: 'Reviews API not yet connected' },
    ],
  }), [dateRange, productSearch, rating]);

  useEffect(() => {
    onExportChange(exportPayload);
  }, [exportPayload, onExportChange]);

  return (
    <div>
      <SectionHeader title="Product reviews" sub="Customer feedback and ratings" />
      <FilterBar>
        <FilterSelect value={dateRange} onChange={setDateRange} icon={<Calendar size={13} />}
          options={[{ label: 'Last 30 days', value: '30d' }, { label: 'Last 90 days', value: '90d' }, { label: 'All time', value: 'all' }]} />
        <FilterSelect value={rating} onChange={setRating}
          options={[{ label: 'Any rating', value: 'all' }, { label: '5 stars only', value: '5' }, { label: '4 stars', value: '4' }, { label: '3 stars and below', value: '3' }]} />
        <FilterSearch placeholder="Search product…" value={productSearch} onChange={setProductSearch} />
      </FilterBar>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Avg. rating" value="—" sub="Across all products" />
        <KpiCard label="Total reviews" value="—" />
        <KpiCard label="5-star reviews" value="—" accent="positive" />
        <KpiCard label="1–2 star reviews" value="—" accent="negative" />
      </div>

      <div className="card p-5 flex flex-col items-center justify-center gap-2 py-16 text-center">
        <Star size={32} className="text-[var(--text-secondary)] opacity-40" />
        <p className="text-sm font-medium text-[var(--text-primary)]">Connect reviews API</p>
        <p className="text-xs text-[var(--text-secondary)] max-w-xs">Add a <code className="text-xs bg-[var(--bg-secondary)] px-1 py-0.5 rounded">getReviewsReport</code> endpoint querying <code className="text-xs bg-[var(--bg-secondary)] px-1 py-0.5 rounded">review</code> joined with <code className="text-xs bg-[var(--bg-secondary)] px-1 py-0.5 rounded">product</code>.</p>
      </div>
    </div>
  );
}

// --- 9. Shipments ---
function ShipmentsReport({ onExportChange }: ReportExportProps) {
  const [dateRange, setDateRange] = useState('30d');
  const [shipStatus, setShipStatus] = useState('all');
  const [trackingSearch, setTrackingSearch] = useState('');

  const exportPayload = useMemo<ReportExportPayload>(() => ({
    title: 'Shipments',
    description: 'Delivery status and tracking for all orders',
    summary: [
      { label: 'Date range', value: dateRange },
      { label: 'Status', value: shipStatus },
      { label: 'Tracking search', value: trackingSearch || 'All shipments' },
      { label: 'Status', value: 'Shipments API not yet connected' },
    ],
  }), [dateRange, shipStatus, trackingSearch]);

  useEffect(() => {
    onExportChange(exportPayload);
  }, [exportPayload, onExportChange]);

  return (
    <div>
      <SectionHeader title="Shipments" sub="Delivery status and tracking for all orders" />
      <FilterBar>
        <FilterSelect value={dateRange} onChange={setDateRange} icon={<Calendar size={13} />}
          options={[{ label: 'Last 7 days', value: '7d' }, { label: 'Last 30 days', value: '30d' }, { label: 'Custom', value: 'custom' }]} />
        <FilterSelect value={shipStatus} onChange={setShipStatus}
          options={[{ label: 'All statuses', value: 'all' }, { label: 'Pending', value: 'pending' }, { label: 'In transit', value: 'in_transit' }, { label: 'Delivered', value: 'delivered' }, { label: 'Failed', value: 'failed' }]} />
        <FilterSearch placeholder="Search tracking no.…" value={trackingSearch} onChange={setTrackingSearch} />
      </FilterBar>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total shipments" value="—" />
        <KpiCard label="In transit" value="—" />
        <KpiCard label="Delivered" value="—" accent="positive" />
        <KpiCard label="Failed / delayed" value="—" accent="negative" />
      </div>

      <div className="card p-5 flex flex-col items-center justify-center gap-2 py-16 text-center">
        <Truck size={32} className="text-[var(--text-secondary)] opacity-40" />
        <p className="text-sm font-medium text-[var(--text-primary)]">Connect shipments API</p>
        <p className="text-xs text-[var(--text-secondary)] max-w-xs">Add a <code className="text-xs bg-[var(--bg-secondary)] px-1 py-0.5 rounded">getShipmentsReport</code> endpoint querying <code className="text-xs bg-[var(--bg-secondary)] px-1 py-0.5 rounded">shipment</code> joined with <code className="text-xs bg-[var(--bg-secondary)] px-1 py-0.5 rounded">orders</code>.</p>
      </div>
    </div>
  );
}

// --- 10. Suborders ---
function SubordersReport({ onExportChange }: ReportExportProps) {
  const [dateRange, setDateRange] = useState('30d');
  const [status, setStatus] = useState('all');

  const exportPayload = useMemo<ReportExportPayload>(() => ({
    title: 'Suborders',
    description: 'Your slice of multi-vendor orders',
    summary: [
      { label: 'Date range', value: dateRange },
      { label: 'Status', value: status },
      { label: 'Status', value: 'Suborders API not yet connected' },
    ],
  }), [dateRange, status]);

  useEffect(() => {
    onExportChange(exportPayload);
  }, [exportPayload, onExportChange]);

  return (
    <div>
      <SectionHeader title="Suborders" sub="Your slice of multi-vendor orders" />
      <FilterBar>
        <FilterSelect value={dateRange} onChange={setDateRange} icon={<Calendar size={13} />}
          options={[{ label: 'Last 7 days', value: '7d' }, { label: 'Last 30 days', value: '30d' }, { label: 'Last 90 days', value: '90d' }]} />
        <FilterSelect value={status} onChange={setStatus}
          options={[{ label: 'All statuses', value: 'all' }, { label: 'Pending', value: 'pending' }, { label: 'Processing', value: 'processing' }, { label: 'Delivered', value: 'delivered' }, { label: 'Cancelled', value: 'cancelled' }]} />
      </FilterBar>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total suborders" value="—" />
        <KpiCard label="Total subtotal" value="—" accent="positive" />
        <KpiCard label="Pending" value="—" />
        <KpiCard label="Delivered" value="—" accent="positive" />
      </div>

      <div className="card p-5 flex flex-col items-center justify-center gap-2 py-16 text-center">
        <Receipt size={32} className="text-[var(--text-secondary)] opacity-40" />
        <p className="text-sm font-medium text-[var(--text-primary)]">Connect suborders API</p>
        <p className="text-xs text-[var(--text-secondary)] max-w-xs">Add a <code className="text-xs bg-[var(--bg-secondary)] px-1 py-0.5 rounded">getSubordersReport</code> endpoint querying <code className="text-xs bg-[var(--bg-secondary)] px-1 py-0.5 rounded">order_suborder</code> filtered by <code className="text-xs bg-[var(--bg-secondary)] px-1 py-0.5 rounded">vendor_id</code>.</p>
      </div>
    </div>
  );
}

// ─── Report renderer ─────────────────────────────────────────────────────────

function ReportContent({ id, onExportChange }: { id: ReportId; onExportChange: (payload: ReportExportPayload) => void; }) {
  switch (id) {
    case 'sales':     return <SalesReport onExportChange={onExportChange} />;
    case 'orders':    return <OrdersReport onExportChange={onExportChange} />;
    case 'products':  return <ProductsReport onExportChange={onExportChange} />;
    case 'inventory': return <InventoryReport onExportChange={onExportChange} />;
    case 'movements': return <MovementsReport onExportChange={onExportChange} />;
    case 'earnings':  return <EarningsReport onExportChange={onExportChange} />;
    case 'payouts':   return <PayoutsReport onExportChange={onExportChange} />;
    case 'reviews':   return <ReviewsReport onExportChange={onExportChange} />;
    case 'shipments': return <ShipmentsReport onExportChange={onExportChange} />;
    case 'suborders': return <SubordersReport onExportChange={onExportChange} />;
    default:          return null;
  }
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function Reports() {
  const [activeReport, setActiveReport] = useState<ReportId>('sales');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [exportPayload, setExportPayload] = useState<ReportExportPayload | null>(null);

  const activeConfig = NAV_REPORTS.find((r) => r.id === activeReport)!;
  const groups = GROUP_ORDER.map((g) => ({
    name: g,
    reports: NAV_REPORTS.filter((r) => r.group === g),
  }));

  const fallbackPayload = useMemo(
    () => buildFallbackExportPayload(activeConfig.label, `Export snapshot for ${activeConfig.label}`),
    [activeConfig]
  );

  const currentExportPayload = exportPayload ?? fallbackPayload;

  const triggerDownload = useCallback((payload: ReportExportPayload, format: 'csv' | 'pdf') => {
    const fileName = `${sanitizeFileName(payload.title)}.${format}`;

    if (format === 'csv') {
      downloadTextFile(fileName, buildCsvContent(payload), 'text/csv');
      return;
    }

    const doc = buildPdfContent(payload);
    doc.save(fileName);
  }, []);

  const handleExportCsv = useCallback(() => {
    triggerDownload(currentExportPayload, 'csv');
  }, [currentExportPayload, triggerDownload]);

  const handleExportPdf = useCallback(() => {
    triggerDownload(currentExportPayload, 'pdf');
  }, [currentExportPayload, triggerDownload]);

  useEffect(() => {
    setExportPayload(null);
  }, [activeReport]);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border-color)] bg-[var(--bg-primary)] flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen((p) => !p)}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors text-[var(--text-secondary)]"
            aria-label="Toggle sidebar"
          >
            <BarChart2 size={16} />
          </button>
          <div>
            <h1 className="text-base font-semibold text-[var(--text-primary)] leading-none">Reports & Analytics</h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Detailed insights into your store's performance</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportCsv} className="btn-secondary flex items-center gap-1.5 text-sm py-1.5">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={handleExportPdf} className="btn-primary flex items-center gap-1.5 text-sm py-1.5">
            <Download size={14} /> Export PDF
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-52 flex-shrink-0 border-r border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-y-auto py-3 px-2">
            {groups.map((group) => (
              <div key={group.name} className="mb-3">
                <p className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-widest px-2 py-1 mb-1">
                  {group.name}
                </p>
                {group.reports.map((report) => {
                  const isActive = activeReport === report.id;
                  return (
                    <button
                      key={report.id}
                      onClick={() => setActiveReport(report.id)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all mb-0.5 text-left ${
                        isActive
                          ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] font-medium shadow-sm border border-[var(--border-color)]'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <span
                        className="flex items-center justify-center w-5 h-5 rounded-md flex-shrink-0"
                        style={{
                          background: isActive ? report.bgColor : 'transparent',
                          color: isActive ? report.color : 'currentColor',
                        }}
                      >
                        {report.icon}
                      </span>
                      {report.label}
                    </button>
                  );
                })}
              </div>
            ))}
          </aside>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6 bg-[var(--bg-primary)]">
          {/* Mobile tab scroller */}
          <div className="flex gap-1 overflow-x-auto pb-2 mb-5 -mx-1 px-1 lg:hidden">
            {NAV_REPORTS.map((r) => (
              <button
                key={r.id}
                onClick={() => setActiveReport(r.id)}
                className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-all whitespace-nowrap ${
                  activeReport === r.id
                    ? 'border-transparent font-medium'
                    : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                style={
                  activeReport === r.id
                    ? { background: r.bgColor, color: r.color, borderColor: 'transparent' }
                    : {}
                }
              >
                {r.label}
              </button>
            ))}
          </div>

          <ReportContent id={activeReport} onExportChange={setExportPayload} />
        </main>
      </div>
    </div>
  );
}