import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Printer, Download, Filter } from 'lucide-react';
import { DataTable, Column } from '../components/shared/DataTable';
import { StatusBadge } from '../components/shared/StatusBadge';
interface Order {
  id: string;
  customer: string;
  date: string;
  total: number;
  items: number;
  status: 'New' | 'Confirmed' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled';
  payment: 'Paid' | 'Pending' | 'Failed';
}
const mockOrders: Order[] = [
{
  id: 'ORD-8492',
  customer: 'John K.',
  date: '2023-10-25 10:42',
  total: 12450,
  items: 3,
  status: 'New',
  payment: 'Paid'
},
{
  id: 'ORD-8491',
  customer: 'Mary S.',
  date: '2023-10-25 09:15',
  total: 3200,
  items: 1,
  status: 'Packed',
  payment: 'Paid'
},
{
  id: 'ORD-8490',
  customer: 'Alice W.',
  date: '2023-10-24 16:30',
  total: 45000,
  items: 5,
  status: 'Shipped',
  payment: 'Paid'
},
{
  id: 'ORD-8489',
  customer: 'Eric N.',
  date: '2023-10-24 14:20',
  total: 8900,
  items: 2,
  status: 'Delivered',
  payment: 'Paid'
},
{
  id: 'ORD-8488',
  customer: 'David O.',
  date: '2023-10-24 11:05',
  total: 1500,
  items: 1,
  status: 'Cancelled',
  payment: 'Failed'
},
{
  id: 'ORD-8487',
  customer: 'Sarah M.',
  date: '2023-10-23 08:45',
  total: 24500,
  items: 4,
  status: 'Delivered',
  payment: 'Paid'
},
{
  id: 'ORD-8486',
  customer: 'Peter J.',
  date: '2023-10-23 07:30',
  total: 6500,
  items: 2,
  status: 'Confirmed',
  payment: 'Pending'
}];

const tabs = [
'All',
'New',
'Confirmed',
'Packed',
'Shipped',
'Delivered',
'Cancelled'];

export function Orders() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const columns: Column<Order>[] = [
  {
    header: 'Order ID',
    accessor: (row) =>
    <span className="font-mono font-medium text-[var(--text-primary)]">
          #{row.id}
        </span>

  },
  {
    header: 'Date',
    accessor: 'date',
    className: 'text-[var(--text-secondary)]'
  },
  {
    header: 'Customer',
    accessor: 'customer'
  },
  {
    header: 'Items',
    accessor: (row) =>
    <span className="text-[var(--text-secondary)]">{row.items} items</span>

  },
  {
    header: 'Total',
    accessor: (row) =>
    <span className="font-mono font-medium">
          KES {row.total.toLocaleString()}
        </span>

  },
  {
    header: 'Status',
    accessor: (row) => {
      let variant: any = 'neutral';
      if (row.status === 'New') variant = 'info';
      if (row.status === 'Delivered') variant = 'success';
      if (row.status === 'Cancelled') variant = 'destructive';
      if (row.status === 'Shipped' || row.status === 'Packed')
      variant = 'warning';
      return <StatusBadge status={row.status} variant={variant} />;
    }
  },
  {
    header: 'Payment',
    accessor: (row) =>
    <span
      className={`text-xs font-medium ${row.payment === 'Paid' ? 'text-success-600' : row.payment === 'Failed' ? 'text-destructive-600' : 'text-warning-600'}`}>
      
          {row.payment}
        </span>

  },
  {
    header: 'Actions',
    accessor: (row) =>
    <div className="flex items-center gap-2">
          <Link
        to={`/orders/${row.id}`}
        className="p-1.5 text-[var(--text-secondary)] hover:text-brand-600 hover:bg-brand-50 rounded transition-colors"
        title="View Details">
        
            <Eye size={18} />
          </Link>
          <button
        className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded transition-colors"
        title="Print Packing Slip">
        
            <Printer size={18} />
          </button>
        </div>

  }];

  const filteredOrders = mockOrders.filter((o) => {
    const matchesTab = activeTab === 'All' || o.status === activeTab;
    const matchesSearch =
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)]">
            Orders
          </h1>
          <p className="text-[var(--text-secondary)]">
            Manage and fulfill your customer orders.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary">
            <Download size={18} /> Export
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
        <div className="flex space-x-1 bg-[var(--bg-secondary)] p-1 rounded-lg border border-[var(--border-color)]">
          {tabs.map((tab) =>
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
            
              {tab}
            </button>
          )}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredOrders}
        searchPlaceholder="Search by Order ID or Customer..."
        onSearch={setSearchQuery}
        actions={
        <button className="btn-secondary py-1.5">
            <Filter size={16} /> Filter
          </button>
        } />
      
    </div>);

}