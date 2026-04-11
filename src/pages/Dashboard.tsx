import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Banknote,
  ShoppingBag,
  Truck,
  Calculator,
  Plus,
  ArrowRight,
  AlertTriangle } from
'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer } from
'recharts';
import { KPICard } from '../components/shared/KPICard';
import { StatusBadge } from '../components/shared/StatusBadge';
// Mock Data
const revenueData = [
{
  name: 'Mon',
  value: 45000
},
{
  name: 'Tue',
  value: 52000
},
{
  name: 'Wed',
  value: 38000
},
{
  name: 'Thu',
  value: 65000
},
{
  name: 'Fri',
  value: 84000
},
{
  name: 'Sat',
  value: 92000
},
{
  name: 'Sun',
  value: 78000
}];

const recentOrders = [
{
  id: '#ORD-8492',
  customer: 'J*** K.',
  items: 3,
  total: 'KES 12,450',
  date: 'Today, 10:42 AM',
  status: 'Pending'
},
{
  id: '#ORD-8491',
  customer: 'M*** S.',
  items: 1,
  total: 'KES 3,200',
  date: 'Today, 09:15 AM',
  status: 'Packed'
},
{
  id: '#ORD-8490',
  customer: 'A*** W.',
  items: 5,
  total: 'KES 45,000',
  date: 'Yesterday',
  status: 'Shipped'
},
{
  id: '#ORD-8489',
  customer: 'E*** N.',
  items: 2,
  total: 'KES 8,900',
  date: 'Yesterday',
  status: 'Delivered'
},
{
  id: '#ORD-8488',
  customer: 'D*** O.',
  items: 1,
  total: 'KES 1,500',
  date: 'Oct 24',
  status: 'Cancelled'
}];

const lowStockItems = [
{
  name: 'Samsung Galaxy A54',
  stock: 3,
  threshold: 5
},
{
  name: 'Sony WH-1000XM5',
  stock: 1,
  threshold: 3
},
{
  name: 'Anker PowerCore 20K',
  stock: 0,
  threshold: 10
}];

export function Dashboard() {
  const [chartPeriod, setChartPeriod] = useState<'day' | 'week' | 'month'>(
    'week'
  );
  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)]">
            Dashboard Overview
          </h1>
          <p className="text-[var(--text-secondary)]">
            Welcome back, here's what's happening with your store today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/products/new" className="btn-primary">
            <Plus size={18} /> Add Product
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KPICard
          title="Total Revenue"
          value="KES 847,320"
          icon={Banknote}
          trend={{
            value: 12.5,
            isPositive: true
          }} />
        
        <KPICard
          title="Orders Today"
          value="23"
          icon={ShoppingBag}
          trend={{
            value: 5.2,
            isPositive: true
          }} />
        
        <KPICard
          title="Pending Shipments"
          value="8"
          icon={Truck}
          trend={{
            value: 2.1,
            isPositive: false
          }} />
        
        <KPICard
          title="Avg. Order Value"
          value="KES 2,450"
          icon={Calculator}
          trend={{
            value: 0.8,
            isPositive: true
          }} />
        
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Revenue Overview
            </h2>
            <div className="flex bg-[var(--bg-secondary)] p-1 rounded-lg border border-[var(--border-color)]">
              {(['day', 'week', 'month'] as const).map((period) =>
              <button
                key={period}
                onClick={() => setChartPeriod(period)}
                className={`px-3 py-1 text-sm font-medium rounded-md capitalize transition-colors ${chartPeriod === period ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                
                  {period}
                </button>
              )}
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={revenueData}
                margin={{
                  top: 5,
                  right: 20,
                  bottom: 5,
                  left: 0
                }}>
                
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border-color)" />
                
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: 'var(--text-secondary)',
                    fontSize: 12
                  }}
                  dy={10} />
                
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: 'var(--text-secondary)',
                    fontSize: 12
                  }}
                  tickFormatter={(value) => `K${value / 1000}k`} />
                
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--border-color)',
                    borderRadius: '8px'
                  }}
                  itemStyle={{
                    color: 'var(--text-primary)'
                  }}
                  formatter={(value: number) => [
                  `KES ${value.toLocaleString()}`,
                  'Revenue']
                  } />
                
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#1d4ed8"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: '#1d4ed8',
                    strokeWidth: 2,
                    stroke: 'var(--bg-primary)'
                  }}
                  activeDot={{
                    r: 6,
                    strokeWidth: 0
                  }} />
                
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="card p-0 flex flex-col">
          <div className="p-5 border-b border-[var(--border-color)] flex items-center gap-2">
            <AlertTriangle className="text-warning-500" size={20} />
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Low Stock Alerts
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {lowStockItems.map((item, i) =>
            <div
              key={i}
              className="flex items-center justify-between p-3 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors">
              
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate max-w-[180px]">
                    {item.name}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Threshold: {item.threshold}
                  </p>
                </div>
                <div className="text-right">
                  <span
                  className={`inline-flex items-center justify-center px-2 py-1 rounded text-xs font-bold font-mono ${item.stock === 0 ? 'bg-destructive-100 text-destructive-700 dark:bg-destructive-900/30 dark:text-destructive-400' : 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400'}`}>
                  
                    {item.stock} left
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-[var(--border-color)] mt-auto">
            <Link
              to="/products"
              className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center justify-center gap-1">
              
              Manage Inventory <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-[var(--border-color)] flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Recent Orders
          </h2>
          <Link
            to="/orders"
            className="text-sm font-medium text-brand-600 hover:text-brand-700">
            
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
              {recentOrders.map((order, i) =>
              <tr
                key={i}
                className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-secondary)]/50 transition-colors">
                
                  <td className="px-5 py-3 font-mono font-medium text-[var(--text-primary)]">
                    {order.id}
                  </td>
                  <td className="px-5 py-3 text-[var(--text-primary)]">
                    {order.customer}
                  </td>
                  <td className="px-5 py-3 text-[var(--text-secondary)]">
                    {order.items}
                  </td>
                  <td className="px-5 py-3 font-mono text-[var(--text-primary)]">
                    {order.total}
                  </td>
                  <td className="px-5 py-3 text-[var(--text-secondary)]">
                    {order.date}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge
                    status={order.status}
                    variant={
                    order.status === 'Delivered' ?
                    'success' :
                    order.status === 'Cancelled' ?
                    'destructive' :
                    order.status === 'Pending' ?
                    'warning' :
                    'info'
                    } />
                  
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>);

}