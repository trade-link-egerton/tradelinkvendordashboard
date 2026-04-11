import React, { useState } from 'react';
import { Download, Calendar } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell } from
'recharts';
const salesData = [
{
  name: 'Mon',
  sales: 4000
},
{
  name: 'Tue',
  sales: 3000
},
{
  name: 'Wed',
  sales: 2000
},
{
  name: 'Thu',
  sales: 2780
},
{
  name: 'Fri',
  sales: 1890
},
{
  name: 'Sat',
  sales: 2390
},
{
  name: 'Sun',
  sales: 3490
}];

const categoryData = [
{
  name: 'Electronics',
  value: 400
},
{
  name: 'Fashion',
  value: 300
},
{
  name: 'Home',
  value: 300
},
{
  name: 'Beauty',
  value: 200
}];

const COLORS = ['#1d4ed8', '#7c3aed', '#0ea5e9', '#10b981'];
export function Reports() {
  const [dateRange, setDateRange] = useState('7d');
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)]">
            Reports & Analytics
          </h1>
          <p className="text-[var(--text-secondary)]">
            Detailed insights into your store's performance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
              size={16} />
            
            <select
              className="input-field pl-9 py-2 bg-[var(--bg-primary)]"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}>
              
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          <button className="btn-secondary">
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <p className="text-sm font-medium text-[var(--text-secondary)] mb-1">
            Total Sales
          </p>
          <h3 className="text-2xl font-bold font-mono text-[var(--text-primary)]">
            KES 1.2M
          </h3>
          <p className="text-sm text-success-600 mt-2">
            +15% from previous period
          </p>
        </div>
        <div className="card p-5">
          <p className="text-sm font-medium text-[var(--text-secondary)] mb-1">
            Total Orders
          </p>
          <h3 className="text-2xl font-bold font-mono text-[var(--text-primary)]">
            342
          </h3>
          <p className="text-sm text-success-600 mt-2">
            +8% from previous period
          </p>
        </div>
        <div className="card p-5">
          <p className="text-sm font-medium text-[var(--text-secondary)] mb-1">
            Average Order Value
          </p>
          <h3 className="text-2xl font-bold font-mono text-[var(--text-primary)]">
            KES 3,508
          </h3>
          <p className="text-sm text-success-600 mt-2">
            +2% from previous period
          </p>
        </div>
        <div className="card p-5">
          <p className="text-sm font-medium text-[var(--text-secondary)] mb-1">
            Refund Rate
          </p>
          <h3 className="text-2xl font-bold font-mono text-[var(--text-primary)]">
            2.4%
          </h3>
          <p className="text-sm text-destructive-600 mt-2">
            +0.5% from previous period
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="card p-5">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">
            Sales Volume
          </h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border-color)" />
                
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: 'var(--text-secondary)'
                  }} />
                
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: 'var(--text-secondary)'
                  }} />
                
                <Tooltip
                  cursor={{
                    fill: 'var(--bg-secondary)'
                  }}
                  contentStyle={{
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--border-color)',
                    borderRadius: '8px'
                  }} />
                
                <Bar dataKey="sales" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Chart */}
        <div className="card p-5">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">
            Revenue by Category
          </h2>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value">
                  
                  {categoryData.map((entry, index) =>
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]} />

                  )}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--border-color)',
                    borderRadius: '8px'
                  }} />
                
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {categoryData.map((entry, index) =>
            <div key={entry.name} className="flex items-center gap-2">
                <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: COLORS[index % COLORS.length]
                }}>
              </div>
                <span className="text-sm text-[var(--text-secondary)]">
                  {entry.name}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>);

}