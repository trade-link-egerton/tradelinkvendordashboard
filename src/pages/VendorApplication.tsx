import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, CheckCircle2, ArrowRight } from 'lucide-react';
import { FileUpload } from '../components/shared/FileUpload';
import { StatusBadge } from '../components/shared/StatusBadge';
const KENYA_COUNTIES = [
'Nairobi',
'Mombasa',
'Kisumu',
'Nakuru',
'Kiambu',
'Machakos',
'Kajiado',
'Uasin Gishu',
'Meru',
'Nyeri'];

export function VendorApplication() {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<'draft' | 'submitted'>('draft');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitted');
  };
  if (status === 'submitted') {
    return (
      <div className="min-h-screen bg-[var(--bg-secondary)] flex flex-col items-center justify-center p-4">
        <div className="card max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-success-50 dark:bg-success-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2
              className="text-success-600 dark:text-success-500"
              size={32} />
            
          </div>
          <h2 className="text-2xl font-heading font-bold text-[var(--text-primary)] mb-2">
            Application Submitted!
          </h2>
          <p className="text-[var(--text-secondary)] mb-6">
            Thank you for applying to sell on TradeLink. Our team will review
            your application within 24-48 hours.
          </p>
          <div className="bg-[var(--bg-secondary)] p-4 rounded-lg mb-6 flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--text-primary)]">
              Current Status:
            </span>
            <StatusBadge status="Under Review" variant="warning" />
          </div>
          <Link to="/login" className="btn-primary w-full">
            Return to Login
          </Link>
        </div>
      </div>);

  }
  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] flex flex-col">
      {/* Header */}
      <header className="bg-[var(--bg-primary)] border-b border-[var(--border-color)] py-4 px-6 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-brand-700 text-white p-1.5 rounded-lg">
            <Store size={24} />
          </div>
          <span className="font-heading font-bold text-xl text-[var(--text-primary)]">
            TradeLink
          </span>
        </div>
        <Link
          to="/login"
          className="text-sm font-medium text-brand-600 hover:text-brand-700">
          
          Already have an account? Log in
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 py-8 lg:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-[var(--text-primary)] mb-2">
            Apply to become a Vendor
          </h1>
          <p className="text-[var(--text-secondary)]">
            Join thousands of Kenyan businesses selling on TradeLink.
          </p>
        </div>

        <div className="card overflow-hidden">
          {/* Progress Steps */}
          <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] p-4 flex justify-between items-center">
            {[1, 2, 3].map((s) =>
            <div key={s} className="flex items-center">
                <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= s ? 'bg-brand-600 text-white' : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border-color)]'}`}>
                
                  {s}
                </div>
                {s < 3 &&
              <div
                className={`w-16 sm:w-32 h-1 mx-2 rounded ${step > s ? 'bg-brand-600' : 'bg-[var(--border-color)]'}`} />

              }
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8">
            {step === 1 &&
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <h2 className="text-xl font-heading font-semibold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2">
                  Business Information
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                      Business Type
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center p-4 border border-[var(--border-color)] rounded-lg cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors">
                        <input
                        type="radio"
                        name="businessType"
                        className="text-brand-600 focus:ring-brand-500"
                        defaultChecked />
                      
                        <span className="ml-3 text-sm font-medium text-[var(--text-primary)]">
                          Individual
                        </span>
                      </label>
                      <label className="flex items-center p-4 border border-[var(--border-color)] rounded-lg cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors">
                        <input
                        type="radio"
                        name="businessType"
                        className="text-brand-600 focus:ring-brand-500" />
                      
                        <span className="ml-3 text-sm font-medium text-[var(--text-primary)]">
                          Registered Business
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                      Store Name
                    </label>
                    <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Nairobi Electronics Hub"
                    required />
                  
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                        Email Address
                      </label>
                      <input
                      type="email"
                      className="input-field"
                      placeholder="you@example.com"
                      required />
                    
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                        Phone Number
                      </label>
                      <input
                      type="tel"
                      className="input-field"
                      placeholder="07XX XXX XXX"
                      required />
                    
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                      Location (County)
                    </label>
                    <select className="input-field bg-[var(--bg-primary)]">
                      <option value="">Select a county</option>
                      {KENYA_COUNTIES.map((c) =>
                    <option key={c} value={c}>
                          {c}
                        </option>
                    )}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-primary">
                  
                    Next Step <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            }

            {step === 2 &&
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <h2 className="text-xl font-heading font-semibold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2">
                  Verification Documents
                </h2>

                <div className="space-y-6">
                  <FileUpload
                  label="National ID or Passport (Front & Back)"
                  accept="image/*,.pdf"
                  multiple />
                

                  <FileUpload
                  label="Business Registration Certificate (Optional for Individuals)"
                  accept=".pdf,image/*" />
                
                </div>

                <div className="flex justify-between pt-4">
                  <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary">
                  
                    Back
                  </button>
                  <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="btn-primary">
                  
                    Next Step <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            }

            {step === 3 &&
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <h2 className="text-xl font-heading font-semibold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2">
                  Payout Details
                </h2>

                <div className="space-y-4">
                  <div className="bg-brand-50 dark:bg-brand-900/20 p-4 rounded-lg border border-brand-100 dark:border-brand-900/50 mb-4">
                    <p className="text-sm text-brand-800 dark:text-brand-300">
                      This is where we will send your earnings. You can change
                      this later in your dashboard.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                      M-Pesa Number (for fast payouts)
                    </label>
                    <input
                    type="tel"
                    className="input-field"
                    placeholder="07XX XXX XXX"
                    required />
                  
                  </div>

                  <div className="relative py-4 flex items-center">
                    <div className="flex-grow border-t border-[var(--border-color)]"></div>
                    <span className="flex-shrink-0 mx-4 text-[var(--text-secondary)] text-sm">
                      OR
                    </span>
                    <div className="flex-grow border-t border-[var(--border-color)]"></div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                      Bank Name
                    </label>
                    <select className="input-field bg-[var(--bg-primary)]">
                      <option value="">Select Bank</option>
                      <option value="kcb">KCB Bank</option>
                      <option value="equity">Equity Bank</option>
                      <option value="coop">Co-operative Bank</option>
                      <option value="sc">Standard Chartered</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                      Account Number
                    </label>
                    <input
                    type="text"
                    className="input-field"
                    placeholder="Enter account number" />
                  
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-secondary">
                  
                    Back
                  </button>
                  <button
                  type="submit"
                  className="btn-primary bg-success-600 hover:bg-success-700 focus:ring-success-500">
                  
                    Submit Application
                  </button>
                </div>
              </div>
            }
          </form>
        </div>
      </main>
    </div>);

}