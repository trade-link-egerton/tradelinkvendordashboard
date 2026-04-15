import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ChevronRightIcon,
  CheckCircle2Icon,
  PackageIcon,
  TruckIcon,
  XCircleIcon,
  PrinterIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Modal } from '../components/shared/Modal';
import { cancelOrder, getOrder, updateOrderStatus } from '../lib/vendorApi';

type OrderStatus = 'New' | 'Pending' | 'Confirmed' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled';

interface OrderItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  image?: string;
  variant?: string;
}

interface OrderView {
  id: string;
  status: OrderStatus;
  date: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  shipping: number;
  commission: number;
  total: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: OrderItem[];
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeStatus(value: unknown): OrderStatus {
  const raw = typeof value === 'string' ? value.toLowerCase() : 'new';
  if (raw === 'new') return 'New';
  if (raw === 'pending') return 'Pending';
  if (raw === 'confirmed') return 'Confirmed';
  if (raw === 'packed') return 'Packed';
  if (raw === 'shipped') return 'Shipped';
  if (raw === 'delivered') return 'Delivered';
  if (raw === 'cancelled') return 'Cancelled';
  return 'New';
}

function mapOrderPayload(payload: Record<string, unknown>, fallbackId: string): OrderView {
  const itemsRaw = Array.isArray(payload.items) ? payload.items : [];
  const items: OrderItem[] = itemsRaw.map((item, idx) => {
    const entry = item as Record<string, unknown>;
    return {
      id: String(entry.id || idx + 1),
      name: String(entry.name || entry.product_name || 'Item'),
      qty: toNumber(entry.qty || entry.quantity || 1),
      price: toNumber(entry.price || entry.unit_price || 0),
      image: typeof entry.image_url === 'string' ? entry.image_url : undefined,
      variant: typeof entry.variant === 'string' ? entry.variant : undefined
    };
  });

  const subtotal = toNumber(payload.subtotal || payload.sub_total || payload.total_amount || payload.total || 0);
  const shipping = toNumber(payload.shipping || payload.shipping_fee || 0);
  const total = toNumber(payload.total_amount || payload.total || subtotal + shipping);

  return {
    id: String(payload.id || fallbackId),
    status: normalizeStatus(payload.status),
    date: typeof payload.created_at === 'string' ? new Date(payload.created_at).toLocaleString() : '-',
    paymentMethod: String(payload.payment_method || 'N/A'),
    paymentStatus: String(payload.payment_status || 'Pending'),
    subtotal,
    shipping,
    commission: toNumber(payload.commission || 0),
    total,
    customerName: String(payload.customer_name || 'Customer'),
    customerPhone: String(payload.customer_phone || '-'),
    customerEmail: String(payload.customer_email || '-'),
    items
  };
}

function getStatusVariant(status: OrderStatus) {
  if (status === 'Delivered') return 'success' as const;
  if (status === 'Cancelled') return 'destructive' as const;
  if (status === 'Shipped' || status === 'Packed') return 'warning' as const;
  if (status === 'New' || status === 'Pending' || status === 'Confirmed') return 'info' as const;
  return 'neutral' as const;
}

export function OrderDetail() {
  const { id = '' } = useParams();
  const [order, setOrder] = useState<OrderView | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const loadOrder = async () => {
    try {
      const payload = await getOrder(id);
      setOrder(mapOrderPayload(payload, id));
    } catch {
      toast.error('Failed to load order details.');
    }
  };

  useEffect(() => {
    if (!id) return;
    void loadOrder();
  }, [id]);

  const handleStatusUpdate = async (status: 'confirmed' | 'packed' | 'shipped') => {
    try {
      await updateOrderStatus(id, status);
      toast.success(`Order marked as ${status}.`);
      await loadOrder();
    } catch {
      toast.error('Unable to update order status.');
    }
  };

  const handleCancel = async () => {
    try {
      await cancelOrder(id);
      toast.success('Order cancelled.');
      setShowCancelModal(false);
      await loadOrder();
    } catch {
      toast.error('Unable to cancel order.');
    }
  };

  const nextAction = useMemo(() => {
    if (!order) return null;

    if (order.status === 'New' || order.status === 'Pending') {
      return {
        label: 'Confirm Order',
        icon: CheckCircle2Icon,
        onClick: () => void handleStatusUpdate('confirmed')
      };
    }
    if (order.status === 'Confirmed') {
      return {
        label: 'Mark as Packed',
        icon: PackageIcon,
        onClick: () => void handleStatusUpdate('packed')
      };
    }
    if (order.status === 'Packed') {
      return {
        label: 'Mark as Shipped',
        icon: TruckIcon,
        onClick: () => void handleStatusUpdate('shipped')
      };
    }

    return null;
  }, [order]);

  const canCancel = order ? ['New', 'Pending', 'Confirmed'].includes(order.status) : false;

  if (!order) {
    return <div className="card p-6 text-[var(--text-secondary)]">Loading order details...</div>;
  }

  return (
    <div className="space-y-6 pb-8">
      <nav className="flex items-center text-sm text-[var(--text-secondary)]">
        <Link to="/orders" className="hover:text-brand-600 transition-colors">
          Orders
        </Link>
        <ChevronRightIcon size={14} className="mx-2" />
        <span className="text-[var(--text-primary)] font-medium">#{order.id}</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)]">Order #{order.id}</h1>
            <p className="text-[var(--text-secondary)] text-sm mt-0.5">Placed on {order.date}</p>
          </div>
          <StatusBadge status={order.status} variant={getStatusVariant(order.status)} />
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => toast.info('Print action is client-side only.')} className="btn-secondary">
            <PrinterIcon size={18} /> Print Packing Slip
          </button>
          {nextAction && (
            <button onClick={nextAction.onClick} className="btn-primary">
              <nextAction.icon size={18} /> {nextAction.label}
            </button>
          )}
          {canCancel && (
            <button onClick={() => setShowCancelModal(true)} className="btn-danger">
              <XCircleIcon size={18} /> Cancel
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card overflow-hidden">
            <div className="p-5 border-b border-[var(--border-color)]">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Order Items ({order.items.length})</h2>
            </div>
            <div className="divide-y divide-[var(--border-color)]">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-5">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=80&h=80&fit=crop'}
                    alt={item.name}
                    className="w-14 h-14 rounded-lg object-cover border border-[var(--border-color)] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--text-primary)] truncate">{item.name}</p>
                    {item.variant && <p className="text-xs text-[var(--text-secondary)] mt-0.5">{item.variant}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono text-sm text-[var(--text-primary)]">KES {item.price.toLocaleString()}</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">Qty: {item.qty}</p>
                  </div>
                  <div className="text-right shrink-0 w-28">
                    <p className="font-mono font-medium text-[var(--text-primary)]">
                      KES {(item.price * item.qty).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[var(--bg-secondary)] p-5 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Subtotal</span>
                <span className="font-mono text-[var(--text-primary)]">KES {order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Shipping</span>
                <span className="font-mono text-[var(--text-primary)]">KES {order.shipping.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Commission</span>
                <span className="font-mono text-destructive-600">-KES {order.commission.toLocaleString()}</span>
              </div>
              <div className="border-t border-[var(--border-color)] pt-2 mt-2 flex justify-between">
                <span className="font-semibold text-[var(--text-primary)]">Total</span>
                <span className="font-mono font-bold text-lg text-[var(--text-primary)]">
                  KES {order.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Customer</h2>
            <p className="text-sm font-medium text-[var(--text-primary)]">{order.customerName}</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">{order.customerPhone}</p>
            <p className="text-sm text-[var(--text-secondary)]">{order.customerEmail}</p>
          </div>

          <div className="card p-5">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Payment</h2>
            <p className="text-sm text-[var(--text-secondary)]">Method: {order.paymentMethod}</p>
            <p className="text-sm text-[var(--text-secondary)]">Status: {order.paymentStatus}</p>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Order"
        footer={
          <>
            <button onClick={() => setShowCancelModal(false)} className="btn-secondary">
              Keep Order
            </button>
            <button onClick={() => void handleCancel()} className="btn-danger">
              Confirm Cancel
            </button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-secondary)] py-2">
          This action will cancel the order in the backend system and cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
