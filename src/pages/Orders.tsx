import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Download, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable, Column } from '../components/shared/DataTable';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Order, listOrders } from '../lib/vendorApi';

interface OrderRow {
  id: string;
  customer: string;
  date: string;
  total: number;
  items: number;
  status: string;
  payment: string;
}

const tabs = ['All', 'New', 'Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];

function capitalize(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

function mapOrderToRow(order: Order): OrderRow {
  return {
    id: String(order.id),
    customer: order.customer_name || 'Customer',
    date: order.created_at ? new Date(order.created_at).toLocaleString() : '-',
    total: Number(order.total_amount || 0),
    items: Number(order.items_count || 0),
    status: capitalize(order.status || 'new'),
    payment: capitalize(order.payment_status || 'pending')
  };
}

export function Orders() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const response = await listOrders();
      setOrders(response.map(mapOrderToRow));
    } catch {
      toast.error('Failed to load orders.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders();
  }, []);

  const columns: Column<OrderRow>[] = [
    {
      header: 'Order ID',
      accessor: (row) => <span className="font-mono font-medium text-[var(--text-primary)]">#{row.id}</span>
    },
    { header: 'Date', accessor: 'date', className: 'text-[var(--text-secondary)]' },
    { header: 'Customer', accessor: 'customer' },
    {
      header: 'Items',
      accessor: (row) => <span className="text-[var(--text-secondary)]">{row.items} items</span>
    },
    {
      header: 'Total',
      accessor: (row) => <span className="font-mono font-medium">KES {row.total.toLocaleString()}</span>
    },
    {
      header: 'Status',
      accessor: (row) => {
        let variant: 'neutral' | 'info' | 'success' | 'destructive' | 'warning' = 'neutral';
        if (row.status === 'New' || row.status === 'Pending' || row.status === 'Confirmed') variant = 'info';
        if (row.status === 'Delivered') variant = 'success';
        if (row.status === 'Cancelled') variant = 'destructive';
        if (row.status === 'Shipped' || row.status === 'Packed') variant = 'warning';

        return <StatusBadge status={row.status} variant={variant} />;
      }
    },
    {
      header: 'Payment',
      accessor: (row) => (
        <span
          className={`text-xs font-medium ${
            row.payment === 'Paid'
              ? 'text-success-600'
              : row.payment === 'Failed'
                ? 'text-destructive-600'
                : 'text-warning-600'
          }`}
        >
          {row.payment}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <Link
            to={`/orders/${row.id}`}
            className="p-1.5 text-[var(--text-secondary)] hover:text-brand-600 hover:bg-brand-50 rounded transition-colors"
            title="View Details"
          >
            <Eye size={18} />
          </Link>
        </div>
      )
    }
  ];

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        const matchesTab = activeTab === 'All' || order.status === activeTab;
        const search = searchQuery.toLowerCase();
        const matchesSearch =
          order.id.toLowerCase().includes(search) || order.customer.toLowerCase().includes(search);

        return matchesTab && matchesSearch;
      }),
    [activeTab, orders, searchQuery]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)]">Orders</h1>
          <p className="text-[var(--text-secondary)]">Manage and fulfill your customer orders.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary" disabled>
            <Download size={18} /> Export
          </button>
        </div>
      </div>

      <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
        <div className="flex space-x-1 bg-[var(--bg-secondary)] p-1 rounded-lg border border-[var(--border-color)]">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredOrders}
        searchPlaceholder="Search by Order ID or Customer..."
        onSearch={setSearchQuery}
        actions={
          <button className="btn-secondary py-1.5" onClick={() => void loadOrders()} disabled={isLoading}>
            <Filter size={16} /> {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        }
      />
    </div>
  );
}
