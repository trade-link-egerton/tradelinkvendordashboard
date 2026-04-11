import React, { useState } from 'react';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import { DataTable, Column } from '../components/shared/DataTable';
import { StatusBadge } from '../components/shared/StatusBadge';
interface ReturnRequest {
  id: string;
  orderId: string;
  customer: string;
  product: string;
  reason: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Refunded';
}
const mockReturns: ReturnRequest[] = [
{
  id: 'RET-1042',
  orderId: 'ORD-8450',
  customer: 'Jane D.',
  product: 'Samsung Galaxy A54 5G',
  reason: 'Defective item',
  date: '2023-10-24',
  status: 'Pending'
},
{
  id: 'RET-1041',
  orderId: 'ORD-8422',
  customer: 'Mike R.',
  product: 'Nike Air Max 270',
  reason: 'Wrong size',
  date: '2023-10-22',
  status: 'Approved'
},
{
  id: 'RET-1040',
  orderId: 'ORD-8399',
  customer: 'Sarah L.',
  product: 'Anker PowerCore 20K',
  reason: 'Changed mind',
  date: '2023-10-20',
  status: 'Rejected'
},
{
  id: 'RET-1039',
  orderId: 'ORD-8350',
  customer: 'Tom B.',
  product: 'Sony WH-1000XM5',
  reason: 'Item not as described',
  date: '2023-10-18',
  status: 'Refunded'
}];

export function Returns() {
  const [searchQuery, setSearchQuery] = useState('');
  const columns: Column<ReturnRequest>[] = [
  {
    header: 'Return ID',
    accessor: (row) =>
    <span className="font-mono font-medium text-[var(--text-primary)]">
          #{row.id}
        </span>

  },
  {
    header: 'Order ID',
    accessor: (row) =>
    <span className="font-mono text-brand-600 hover:underline cursor-pointer">
          #{row.orderId}
        </span>

  },
  {
    header: 'Product',
    accessor: (row) =>
    <div>
          <p className="text-[var(--text-primary)] font-medium truncate max-w-[200px]">
            {row.product}
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            Customer: {row.customer}
          </p>
        </div>

  },
  {
    header: 'Reason',
    accessor: 'reason',
    className: 'text-[var(--text-secondary)]'
  },
  {
    header: 'Date',
    accessor: 'date',
    className: 'text-[var(--text-secondary)]'
  },
  {
    header: 'Status',
    accessor: (row) => {
      let variant: any = 'neutral';
      if (row.status === 'Pending') variant = 'warning';
      if (row.status === 'Approved') variant = 'info';
      if (row.status === 'Refunded') variant = 'success';
      if (row.status === 'Rejected') variant = 'destructive';
      return <StatusBadge status={row.status} variant={variant} />;
    }
  },
  {
    header: 'Actions',
    accessor: (row) =>
    <div className="flex items-center gap-2">
          {row.status === 'Pending' &&
      <>
              <button
          className="p-1.5 text-success-600 hover:bg-success-50 rounded transition-colors"
          title="Approve">
          
                <CheckCircle size={18} />
              </button>
              <button
          className="p-1.5 text-destructive-600 hover:bg-destructive-50 rounded transition-colors"
          title="Reject">
          
                <XCircle size={18} />
              </button>
            </>
      }
          <button
        className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded transition-colors"
        title="View Details">
        
            <Eye size={18} />
          </button>
        </div>

  }];

  const filteredReturns = mockReturns.filter(
    (r) =>
    r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.orderId.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)]">
          Returns & Cancellations
        </h1>
        <p className="text-[var(--text-secondary)]">
          Manage customer return requests and refunds.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={filteredReturns}
        searchPlaceholder="Search by Return ID or Order ID..."
        onSearch={setSearchQuery} />
      
    </div>);

}