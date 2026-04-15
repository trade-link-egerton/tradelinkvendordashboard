import React, { useEffect, useState } from 'react';
import { Wallet, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable, Column } from '../components/shared/DataTable';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Modal } from '../components/shared/Modal';
import { getWallet, listPayouts, Payout, Wallet as WalletData } from '../lib/vendorApi';

interface PayoutRow {
  id: string;
  date: string;
  amount: number;
  method: string;
  status: string;
}

function mapPayout(payout: Payout): PayoutRow {
  return {
    id: String(payout.id),
    date: payout.created_at ? new Date(payout.created_at).toLocaleDateString() : payout.date || '-',
    amount: Number(payout.amount || 0),
    method: payout.method || 'N/A',
    status: payout.status || 'Processing'
  };
}

export function Payouts() {
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [wallet, setWallet] = useState<WalletData>({ available_balance: 0, pending_balance: 0 });
  const [payouts, setPayouts] = useState<PayoutRow[]>([]);

  const loadData = async () => {
    try {
      const [walletRes, payoutsRes] = await Promise.all([getWallet(), listPayouts()]);
      setWallet(walletRes);
      setPayouts(payoutsRes.map(mapPayout));
    } catch {
      toast.error('Failed to load payouts and wallet.');
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const columns: Column<PayoutRow>[] = [
    {
      header: 'Payout ID',
      accessor: (row) => <span className="font-mono text-[var(--text-primary)]">#{row.id}</span>
    },
    { header: 'Date', accessor: 'date', className: 'text-[var(--text-secondary)]' },
    {
      header: 'Amount',
      accessor: (row) => <span className="font-mono font-medium">KES {row.amount.toLocaleString()}</span>
    },
    { header: 'Method', accessor: 'method', className: 'text-[var(--text-secondary)]' },
    {
      header: 'Status',
      accessor: (row) => {
        const normalized = row.status.toLowerCase();
        let variant: 'neutral' | 'success' | 'warning' | 'destructive' = 'neutral';
        if (normalized === 'completed') variant = 'success';
        if (normalized === 'processing') variant = 'warning';
        if (normalized === 'failed') variant = 'destructive';
        return <StatusBadge status={row.status} variant={variant} />;
      }
    }
  ];

  const available = Number(wallet.available_balance || 0);
  const pending = Number(wallet.pending_balance || 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)]">Payouts</h1>
        <p className="text-[var(--text-secondary)]">Manage your earnings and withdrawals.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 md:col-span-2 bg-gradient-to-br from-brand-700 to-brand-900 text-white border-none relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Wallet size={120} />
          </div>
          <div className="relative z-10">
            <p className="text-brand-100 font-medium mb-1">Available Balance</p>
            <h2 className="text-4xl font-bold font-mono mb-6">KES {available.toLocaleString()}</h2>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsWithdrawModalOpen(true)}
                className="bg-white text-brand-700 hover:bg-brand-50 font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
              >
                Withdraw Funds <ArrowUpRight size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="card p-6 flex flex-col justify-center">
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Pending Clearance:{' '}
            <span className="font-mono font-medium text-[var(--text-primary)]">KES {pending.toLocaleString()}</span>
          </p>
          <div className="bg-brand-50 dark:bg-brand-900/20 p-4 rounded-lg border border-brand-100 dark:border-brand-900/50">
            <p className="text-sm text-brand-800 dark:text-brand-300 font-medium mb-1">Payout Schedule</p>
            <p className="text-xs text-brand-600 dark:text-brand-400">
              TradeLink processes payouts based on your backend payout cycle settings.
            </p>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-5 border-b border-[var(--border-color)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Payout History</h2>
        </div>
        <DataTable columns={columns} data={payouts} searchPlaceholder="Search payouts..." />
      </div>

      <Modal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        title="Withdraw Funds"
        footer={
          <>
            <button onClick={() => setIsWithdrawModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button className="btn-primary" onClick={() => setIsWithdrawModalOpen(false)}>
              Request Withdrawal
            </button>
          </>
        }
      >
        <div className="space-y-4 py-2">
          <p className="text-sm text-[var(--text-secondary)]">
            Available for withdrawal: KES {available.toLocaleString()}.
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            Direct withdrawal endpoint was not included in the API doc, so this action currently closes the modal only.
          </p>
        </div>
      </Modal>
    </div>
  );
}
