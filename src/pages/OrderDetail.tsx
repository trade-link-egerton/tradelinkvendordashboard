import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ChevronRightIcon,
  CheckCircle2Icon,
  PackageIcon,
  TruckIcon,
  XCircleIcon,
  PrinterIcon,
  ClockIcon,
  MapPinIcon,
  CreditCardIcon,
  UserIcon } from
'lucide-react';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Modal } from '../components/shared/Modal';
import { toast } from 'sonner';
interface TimelineEvent {
  status: string;
  date: string;
  description: string;
}
const mockOrder = {
  id: 'ORD-8492',
  status: 'Confirmed' as const,
  date: '2023-10-25 10:42 AM',
  paymentMethod: 'M-Pesa',
  paymentStatus: 'Paid',
  subtotal: 11250,
  shipping: 500,
  commission: 940,
  total: 12450,
  customer: {
    name: 'J*** K.',
    phone: '+254 7** *** *78',
    email: 'j***k@gmail.com'
  },
  shipping_address: {
    line1: 'Apartment 4B, Sunrise Heights',
    line2: 'Ngong Road, Kilimani',
    city: 'Nairobi',
    county: 'Nairobi County',
    postalCode: '00100'
  },
  delivery: {
    method: 'Standard Delivery',
    estimatedDate: 'Oct 28 – Oct 30, 2023',
    tracking: null as string | null
  },
  items: [
  {
    id: '1',
    name: 'Samsung Galaxy A54 5G',
    variant: 'Black / 128GB',
    qty: 1,
    price: 45000,
    image:
    'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=80&h=80&fit=crop'
  },
  {
    id: '2',
    name: 'Anker PowerCore 20K',
    variant: 'White',
    qty: 2,
    price: 6500,
    image:
    'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=80&h=80&fit=crop'
  },
  {
    id: '4',
    name: 'USB-C Fast Charging Cable (2m)',
    variant: null,
    qty: 3,
    price: 850,
    image:
    'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=80&h=80&fit=crop'
  }],

  timeline: [
  {
    status: 'Order Placed',
    date: 'Oct 25, 2023 — 10:42 AM',
    description:
    'Customer placed the order and payment was received via M-Pesa.'
  },
  {
    status: 'Order Confirmed',
    date: 'Oct 25, 2023 — 11:15 AM',
    description: 'You confirmed the order and began preparing it.'
  }] as
  TimelineEvent[]
};
type OrderStatus =
'New' |
'Confirmed' |
'Packed' |
'Shipped' |
'Delivered' |
'Cancelled';
function getStatusVariant(status: string) {
  switch (status) {
    case 'New':
      return 'info' as const;
    case 'Confirmed':
      return 'info' as const;
    case 'Packed':
      return 'warning' as const;
    case 'Shipped':
      return 'warning' as const;
    case 'Delivered':
      return 'success' as const;
    case 'Cancelled':
      return 'destructive' as const;
    default:
      return 'neutral' as const;
  }
}
export function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(mockOrder);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const handleStatusUpdate = (
  newStatus: OrderStatus,
  timelineEntry: TimelineEvent) =>
  {
    setOrder((prev) => ({
      ...prev,
      status: newStatus,
      timeline: [...prev.timeline, timelineEntry]
    }));
    toast.success(`Order marked as ${newStatus}`);
  };
  const handleConfirm = () => {
    handleStatusUpdate('Confirmed', {
      status: 'Order Confirmed',
      date: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      }),
      description: 'You confirmed the order and began preparing it.'
    });
  };
  const handleMarkPacked = () => {
    handleStatusUpdate('Packed', {
      status: 'Packed',
      date: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      }),
      description: 'Order has been packed and is ready for pickup.'
    });
  };
  const handleMarkShipped = () => {
    handleStatusUpdate('Shipped', {
      status: 'Shipped',
      date: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      }),
      description: 'Order has been handed to the delivery partner.'
    });
  };
  const handleCancel = () => {
    handleStatusUpdate('Cancelled', {
      status: 'Cancelled',
      date: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      }),
      description: 'Order was cancelled by the vendor.'
    });
    setShowCancelModal(false);
  };
  const getNextAction = () => {
    switch (order.status) {
      case 'New':
        return {
          label: 'Confirm Order',
          icon: CheckCircle2Icon,
          onClick: handleConfirm,
          style: 'btn-primary'
        };
      case 'Confirmed':
        return {
          label: 'Mark as Packed',
          icon: PackageIcon,
          onClick: handleMarkPacked,
          style: 'btn-primary'
        };
      case 'Packed':
        return {
          label: 'Mark as Shipped',
          icon: TruckIcon,
          onClick: handleMarkShipped,
          style: 'btn-primary'
        };
      default:
        return null;
    }
  };
  const nextAction = getNextAction();
  const canCancel = ['New', 'Confirmed'].includes(order.status);
  return (
    <div className="space-y-6 pb-8">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-[var(--text-secondary)]">
        <Link to="/orders" className="hover:text-brand-600 transition-colors">
          Orders
        </Link>
        <ChevronRightIcon size={14} className="mx-2" />
        <span className="text-[var(--text-primary)] font-medium">
          #{order.id}
        </span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)]">
              Order #{order.id}
            </h1>
            <p className="text-[var(--text-secondary)] text-sm mt-0.5">
              Placed on {order.date}
            </p>
          </div>
          <StatusBadge
            status={order.status}
            variant={getStatusVariant(order.status)} />
          
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => toast.info('Packing slip sent to printer')}
            className="btn-secondary">
            
            <PrinterIcon size={18} /> Print Packing Slip
          </button>
          {nextAction &&
          <button onClick={nextAction.onClick} className={nextAction.style}>
              <nextAction.icon size={18} /> {nextAction.label}
            </button>
          }
          {canCancel &&
          <button
            onClick={() => setShowCancelModal(true)}
            className="btn-danger">
            
              <XCircleIcon size={18} /> Cancel
            </button>
          }
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — Line Items + Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Line Items */}
          <div className="card overflow-hidden">
            <div className="p-5 border-b border-[var(--border-color)]">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Order Items ({order.items.length})
              </h2>
            </div>
            <div className="divide-y divide-[var(--border-color)]">
              {order.items.map((item) =>
              <div key={item.id} className="flex items-center gap-4 p-5">
                  <img
                  src={item.image}
                  alt={item.name}
                  className="w-14 h-14 rounded-lg object-cover border border-[var(--border-color)] shrink-0" />
                
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--text-primary)] truncate">
                      {item.name}
                    </p>
                    {item.variant &&
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                        {item.variant}
                      </p>
                  }
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono text-sm text-[var(--text-primary)]">
                      KES {item.price.toLocaleString()}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      Qty: {item.qty}
                    </p>
                  </div>
                  <div className="text-right shrink-0 w-28">
                    <p className="font-mono font-medium text-[var(--text-primary)]">
                      KES {(item.price * item.qty).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-[var(--bg-secondary)] p-5 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Subtotal</span>
                <span className="font-mono text-[var(--text-primary)]">
                  KES {order.subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Shipping</span>
                <span className="font-mono text-[var(--text-primary)]">
                  KES {order.shipping.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">
                  Commission (8%)
                </span>
                <span className="font-mono text-destructive-600">
                  -KES {order.commission.toLocaleString()}
                </span>
              </div>
              <div className="border-t border-[var(--border-color)] pt-2 mt-2 flex justify-between">
                <span className="font-semibold text-[var(--text-primary)]">
                  Total
                </span>
                <span className="font-mono font-bold text-lg text-[var(--text-primary)]">
                  KES {order.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="card p-5">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">
              Order Timeline
            </h2>
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-[var(--border-color)]" />

              <div className="space-y-6">
                {order.timeline.map((event, i) =>
                <div key={i} className="relative flex gap-4">
                    <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${i === order.timeline.length - 1 ? 'bg-brand-600 text-white' : 'bg-[var(--bg-secondary)] border-2 border-[var(--border-color)] text-[var(--text-secondary)]'}`}>
                    
                      <ClockIcon size={14} />
                    </div>
                    <div className="pb-1">
                      <p className="font-medium text-[var(--text-primary)]">
                        {event.status}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                        {event.date}
                      </p>
                      <p className="text-sm text-[var(--text-secondary)] mt-1">
                        {event.description}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column — Customer, Shipping, Payment */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <UserIcon size={18} className="text-[var(--text-secondary)]" />
              <h3 className="font-semibold text-[var(--text-primary)]">
                Customer
              </h3>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-[var(--text-secondary)]">Name</p>
                <p className="font-medium text-[var(--text-primary)]">
                  {order.customer.name}
                </p>
              </div>
              <div>
                <p className="text-[var(--text-secondary)]">Phone</p>
                <p className="font-mono text-[var(--text-primary)]">
                  {order.customer.phone}
                </p>
              </div>
              <div>
                <p className="text-[var(--text-secondary)]">Email</p>
                <p className="text-[var(--text-primary)]">
                  {order.customer.email}
                </p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <MapPinIcon size={18} className="text-[var(--text-secondary)]" />
              <h3 className="font-semibold text-[var(--text-primary)]">
                Shipping Address
              </h3>
            </div>
            <div className="text-sm text-[var(--text-primary)] space-y-1">
              <p>{order.shipping_address.line1}</p>
              <p>{order.shipping_address.line2}</p>
              <p>
                {order.shipping_address.city},{' '}
                {order.shipping_address.postalCode}
              </p>
              <p className="text-[var(--text-secondary)]">
                {order.shipping_address.county}
              </p>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <TruckIcon size={18} className="text-[var(--text-secondary)]" />
              <h3 className="font-semibold text-[var(--text-primary)]">
                Delivery
              </h3>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-[var(--text-secondary)]">Method</p>
                <p className="font-medium text-[var(--text-primary)]">
                  {order.delivery.method}
                </p>
              </div>
              <div>
                <p className="text-[var(--text-secondary)]">
                  Estimated Delivery
                </p>
                <p className="text-[var(--text-primary)]">
                  {order.delivery.estimatedDate}
                </p>
              </div>
              {order.delivery.tracking &&
              <div>
                  <p className="text-[var(--text-secondary)]">
                    Tracking Number
                  </p>
                  <p className="font-mono text-brand-600">
                    {order.delivery.tracking}
                  </p>
                </div>
              }
            </div>
          </div>

          {/* Payment Info */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <CreditCardIcon
                size={18}
                className="text-[var(--text-secondary)]" />
              
              <h3 className="font-semibold text-[var(--text-primary)]">
                Payment
              </h3>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-[var(--text-secondary)]">Method</p>
                <p className="font-medium text-[var(--text-primary)]">
                  {order.paymentMethod}
                </p>
              </div>
              <div>
                <p className="text-[var(--text-secondary)]">Status</p>
                <StatusBadge status={order.paymentStatus} variant="success" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Order"
        footer={
        <>
            <button
            onClick={() => setShowCancelModal(false)}
            className="btn-secondary">
            
              Keep Order
            </button>
            <button onClick={handleCancel} className="btn-danger">
              Yes, Cancel Order
            </button>
          </>
        }>
        
        <div className="space-y-4">
          <p className="text-[var(--text-primary)]">
            Are you sure you want to cancel order{' '}
            <span className="font-mono font-bold">#{order.id}</span>?
          </p>
          <p className="text-sm text-[var(--text-secondary)]">
            This action cannot be undone. The customer will be notified and a
            refund will be initiated automatically.
          </p>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Reason for cancellation
            </label>
            <select className="input-field">
              <option>Out of stock</option>
              <option>Customer requested</option>
              <option>Unable to fulfill</option>
              <option>Pricing error</option>
              <option>Other</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>);

}