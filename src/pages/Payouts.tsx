import React, { useState } from 'react';
import { Wallet, ArrowUpRight, Building2, Smartphone } from 'lucide-react';
import { DataTable, Column } from '../components/shared/DataTable';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Modal } from '../components/shared/Modal';
interface Payout {
  id: string;
  date: string;
  amount: number;
  method: string;
  status: 'Completed' | 'Processing' | 'Failed';
}
const mockPayouts: Payout[] = [
{
  id: 'PAY-9012',
  date: '2023-10-24',
  amount: 45000,
  method: 'M-Pesa (***4567)',
  status: 'Processing'
},
{
  id: 'PAY-9011',
  date: '2023-10-17',
  amount: 38500,
  method: 'KCB Bank (***8901)',
  status: 'Completed'
},
{
  id: 'PAY-9010',
  date: '2023-10-10',
  amount: 52000,
  method: 'M-Pesa (***4567)',
  status: 'Completed'
},
{
  id: 'PAY-9009',
  date: '2023-10-03',
  amount: 12400,
  method: 'M-Pesa (***4567)',
  status: 'Completed'
}];

export function Payouts() {
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const columns: Column<Payout>[] = [
  {
    header: 'Payout ID',
    accessor: (row) =>
    <span className="font-mono text-[var(--text-primary)]">#{row.id}</span>

  },
  {
    header: 'Date',
    accessor: 'date',
    className: 'text-[var(--text-secondary)]'
  },
  {
    header: 'Amount',
    accessor: (row) =>
    <span className="font-mono font-medium">
          KES {row.amount.toLocaleString()}
        </span>

  },
  {
    header: 'Method',
    accessor: 'method',
    className: 'text-[var(--text-secondary)]'
  },
  {
    header: 'Status',
    accessor: (row) => {
      let variant: any = 'neutral';
      if (row.status === 'Completed') variant = 'success';
      if (row.status === 'Processing') variant = 'warning';
      if (row.status === 'Failed') variant = 'destructive';
      return <StatusBadge status={row.status} variant={variant} />;
    }
  }];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)]">
          Payouts
        </h1>
        <p className="text-[var(--text-secondary)]">
          Manage your earnings and withdrawals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="card p-6 md:col-span-2 bg-gradient-to-br from-brand-700 to-brand-900 text-white border-none relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Wallet size={120} />
          </div>
          <div className="relative z-10">
            <p className="text-brand-100 font-medium mb-1">Available Balance</p>
            <h2 className="text-4xl font-bold font-mono mb-6">KES 124,500</h2>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsWithdrawModalOpen(true)}
                className="bg-white text-brand-700 hover:bg-brand-50 font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2">
                
                Withdraw Funds <ArrowUpRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="card p-6 flex flex-col justify-center">
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Pending Clearance:{' '}
            <span className="font-mono font-medium text-[var(--text-primary)]">
              KES 18,200
            </span>
          </p>
          <div className="bg-brand-50 dark:bg-brand-900/20 p-4 rounded-lg border border-brand-100 dark:border-brand-900/50">
            <p className="text-sm text-brand-800 dark:text-brand-300 font-medium mb-1">
              Commission Rate
            </p>
            <p className="text-xs text-brand-600 dark:text-brand-400">
              TradeLink takes 8% per sale. Payouts are processed every Tuesday.
            </p>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-5 border-b border-[var(--border-color)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Payout History
          </h2>
        </div>
        <DataTable
          columns={columns}
          data={mockPayouts}
          searchPlaceholder="Search payouts..." />
        
      </div>

      {/* Withdraw Modal */}
      <Modal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        title="Withdraw Funds"
        footer={
        <>
            <button
            onClick={() => setIsWithdrawModalOpen(false)}
            className="btn-secondary">
            
              Cancel
            </button>
            <button className="btn-primary">Confirm Withdrawal</button>
          </>
        }>
        
        <div className="space-y-6 py-2">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Amount to Withdraw (KES)
            </label>
            <input
              type="number"
              className="input-field font-mono text-lg"
              defaultValue={124500}
              max={124500} />
            
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Available: KES 124,500
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
              Select Destination
            </label>
            <div className="space-y-3">
              <label className="flex items-center p-4 border border-brand-500 bg-brand-50 dark:bg-brand-900/10 rounded-lg cursor-pointer">
                <input
                  type="radio"
                  name="payoutMethod"
                  className="text-brand-600 focus:ring-brand-500"
                  defaultChecked />
                
                <div className="ml-3 flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-[var(--bg-primary)] rounded shadow-sm">
                    <Smartphone size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      M-Pesa
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      07XX XXX 567
                    </p>
                  </div>
                </div>
              </label>

              <label className="flex items-center p-4 border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] rounded-lg cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="payoutMethod"
                  className="text-brand-600 focus:ring-brand-500" />
                
                <div className="ml-3 flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-[var(--bg-primary)] rounded shadow-sm">
                    <Building2 size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      KCB Bank
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Acct: ****8901
                    </p>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </Modal>
    </div>);

}