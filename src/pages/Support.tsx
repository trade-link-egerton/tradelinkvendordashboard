import React, { useState } from 'react';
import { LifeBuoy, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { StatusBadge } from '../components/shared/StatusBadge';
const faqs = [
{
  q: 'When do I get paid?',
  a: 'TradeLink processes payouts every Tuesday for all orders completed in the previous week (Monday to Sunday). Funds are sent directly to your configured M-Pesa or Bank account.'
},
{
  q: 'How do I handle a return request?',
  a: 'When a customer requests a return, it will appear in your Returns tab. You have 48 hours to approve or reject it based on our return policy. If approved, the customer will ship the item back to you, and the refund will be deducted from your next payout.'
},
{
  q: 'What are the commission fees?',
  a: 'TradeLink charges a flat 8% commission on the final sale price of all items. There are no listing fees or monthly subscription costs.'
}];

export function Support() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)]">
          Vendor Support
        </h1>
        <p className="text-[var(--text-secondary)]">
          Get help with your store, orders, or account.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-heading font-semibold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-3 mb-6">
              Open a Support Ticket
            </h2>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                  Issue Type
                </label>
                <select className="input-field bg-[var(--bg-primary)]">
                  <option>Order Issue</option>
                  <option>Payout / Billing</option>
                  <option>Technical Problem</option>
                  <option>Account Settings</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Brief summary of the issue" />
                
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                  Description
                </label>
                <textarea
                  className="input-field min-h-[150px]"
                  placeholder="Please provide as much detail as possible...">
                </textarea>
              </div>

              <div className="flex justify-end pt-2">
                <button type="button" className="btn-primary">
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>

          {/* Ticket History */}
          <div className="card overflow-hidden">
            <div className="p-5 border-b border-[var(--border-color)]">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Recent Tickets
              </h2>
            </div>
            <div className="divide-y divide-[var(--border-color)]">
              {[
              {
                id: 'TKT-1042',
                subject: 'Missing payout for last week',
                status: 'Resolved',
                date: 'Oct 15, 2023'
              },
              {
                id: 'TKT-1089',
                subject: 'Cannot upload product images',
                status: 'In Progress',
                date: 'Oct 24, 2023'
              }].
              map((ticket, i) =>
              <div
                key={i}
                className="p-4 hover:bg-[var(--bg-secondary)] transition-colors flex items-center justify-between">
                
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">
                      {ticket.subject}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      #{ticket.id} • {ticket.date}
                    </p>
                  </div>
                  <StatusBadge
                  status={ticket.status}
                  variant={
                  ticket.status === 'Resolved' ? 'success' : 'warning'
                  } />
                
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card p-6 bg-brand-50 dark:bg-brand-900/20 border-brand-100 dark:border-brand-900/50">
            <div className="w-12 h-12 bg-white dark:bg-[var(--bg-primary)] rounded-full flex items-center justify-center mb-4 shadow-sm">
              <MessageSquare className="text-brand-600 dark:text-brand-400" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              Need urgent help?
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Our vendor support team is available Monday to Friday, 8am to 6pm
              EAT.
            </p>
            <p className="font-medium text-[var(--text-primary)]">
              Call: 0800 722 000
            </p>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Frequently Asked Questions
            </h3>
            <div className="space-y-3">
              {faqs.map((faq, i) =>
              <div
                key={i}
                className="border border-[var(--border-color)] rounded-lg overflow-hidden">
                
                  <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-3 text-left bg-[var(--bg-secondary)] hover:bg-[var(--bg-secondary)]/80 transition-colors">
                  
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {faq.q}
                    </span>
                    {openFaq === i ?
                  <ChevronUp size={16} /> :

                  <ChevronDown size={16} />
                  }
                  </button>
                  {openFaq === i &&
                <div className="p-3 text-sm text-[var(--text-secondary)] bg-[var(--bg-primary)]">
                      {faq.a}
                    </div>
                }
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>);

}