import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, CheckCircle2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { ApiError } from '../lib/api';
import { setAccessToken } from '../lib/auth';
import { extractAccessToken, getVendorApplication, registerVendorAccount, submitVendorApplication } from '../lib/vendorApi';

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
  'Nyeri'
];

export function VendorApplication() {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<'draft' | 'submitted'>('draft');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [businessName, setBusinessName] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [taxId, setTaxId] = useState('');
  const [county, setCounty] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  useEffect(() => {
    const loadExistingApplication = async () => {
      try {
        const existing = await getVendorApplication();
        if (existing && Object.keys(existing).length > 0) {
          const currentStatus = String(existing.status || 'draft').toLowerCase();
          if (currentStatus === 'submitted' || currentStatus === 'approved' || currentStatus === 'pending') {
            setStatus('submitted');
          }
        }
      } catch {
        // Application may not exist yet; ignore.
      }
    };

    void loadExistingApplication();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== passwordConfirm) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const registerResponse = await registerVendorAccount({
        username: username.trim(),
        email: businessEmail.trim(),
        password,
        password_confirm: passwordConfirm,
        role: 'vendor'
      });

      const accessToken = extractAccessToken(registerResponse);
      if (!accessToken) {
        throw new Error('Registration succeeded but access token was not returned.');
      }

      setAccessToken(accessToken);

      await submitVendorApplication({
        business_name: businessName,
        business_email: businessEmail,
        business_phone: businessPhone,
        tax_id: taxId,
        review_notes: `County: ${county}`
      });
      setStatus('submitted');
      toast.success('Application submitted successfully.');
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.detail
          : error instanceof Error
            ? error.message
            : 'Unable to submit application.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'submitted') {
    return (
      <div className="min-h-screen bg-[var(--bg-secondary)] flex flex-col items-center justify-center p-4">
        <div className="card max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-success-50 dark:bg-success-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-success-600 dark:text-success-500" size={32} />
          </div>
          <h2 className="text-2xl font-heading font-bold text-[var(--text-primary)] mb-2">Application Submitted!</h2>
          <p className="text-[var(--text-secondary)] mb-6">
            Thank you for applying to sell on TradeLink. Our team will review your application within 24-48 hours.
          </p>
          <Link to="/login" className="btn-primary w-full">
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] flex flex-col">
      <header className="bg-[var(--bg-primary)] border-b border-[var(--border-color)] py-4 px-6 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-brand-700 text-white p-1.5 rounded-lg">
            <Store size={24} />
          </div>
          <span className="font-heading font-bold text-xl text-[var(--text-primary)]">TradeLink</span>
        </div>
        <Link to="/login" className="text-sm font-medium text-brand-600 hover:text-brand-700">
          Already have an account? Log in
        </Link>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto p-4 py-8 lg:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-[var(--text-primary)] mb-2">Apply to become a Vendor</h1>
          <p className="text-[var(--text-secondary)]">Join thousands of Kenyan businesses selling on TradeLink.</p>
        </div>

        <div className="card overflow-hidden">
          <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] p-4 flex justify-between items-center">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= s
                      ? 'bg-brand-600 text-white'
                      : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border-color)]'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-16 sm:w-32 h-1 mx-2 rounded ${step > s ? 'bg-brand-600' : 'bg-[var(--border-color)]'}`}
                  />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8">
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <h2 className="text-xl font-heading font-semibold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2">
                  Business Information
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Store Name</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Nairobi Electronics Hub"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Email Address</label>
                      <input
                        type="email"
                        className="input-field"
                        placeholder="you@example.com"
                        required
                        value={businessEmail}
                        onChange={(e) => setBusinessEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Phone Number</label>
                      <input
                        type="tel"
                        className="input-field"
                        placeholder="07XX XXX XXX"
                        required
                        value={businessPhone}
                        onChange={(e) => setBusinessPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Location (County)</label>
                    <select
                      className="input-field bg-[var(--bg-primary)]"
                      value={county}
                      onChange={(e) => setCounty(e.target.value)}
                      required
                    >
                      <option value="">Select a county</option>
                      {KENYA_COUNTIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button type="button" onClick={() => setStep(2)} className="btn-primary">
                    Next Step <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <h2 className="text-xl font-heading font-semibold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2">
                  Account & Compliance
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Username</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Choose a username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Password</label>
                      <input
                        type="password"
                        className="input-field"
                        placeholder="Create password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Confirm Password</label>
                      <input
                        type="password"
                        className="input-field"
                        placeholder="Repeat password"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        autoComplete="new-password"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Tax ID / Registration Number</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. A12345"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary">
                    Back
                  </button>
                  <button type="button" onClick={() => setStep(3)} className="btn-primary">
                    Next Step <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <h2 className="text-xl font-heading font-semibold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2">
                  Confirm & Submit
                </h2>

                <div className="bg-brand-50 dark:bg-brand-900/20 p-4 rounded-lg border border-brand-100 dark:border-brand-900/50">
                  <p className="text-sm text-brand-800 dark:text-brand-300">
                    Review your details and submit your vendor application for admin approval.
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <p className="text-[var(--text-primary)]">
                    <strong>Business:</strong> {businessName}
                  </p>
                  <p className="text-[var(--text-primary)]">
                    <strong>Email:</strong> {businessEmail}
                  </p>
                  <p className="text-[var(--text-primary)]">
                    <strong>Phone:</strong> {businessPhone}
                  </p>
                  <p className="text-[var(--text-primary)]">
                    <strong>County:</strong> {county}
                  </p>
                </div>

                <div className="flex justify-between pt-4">
                  <button type="button" onClick={() => setStep(2)} className="btn-secondary">
                    Back
                  </button>
                  <button
                    type="submit"
                    className="btn-primary bg-success-600 hover:bg-success-700 focus:ring-success-500"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
