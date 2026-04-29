import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

import { ApiError } from '../lib/api';
import { setAccessToken, getAccessToken, clearAccessToken } from '../lib/auth';

import {
  extractAccessToken,
  getVendorApplication,
  registerVendorAccount,
  submitVendorApplication
} from '../lib/vendorApi';

const KENYA_COUNTIES = [
  'Nairobi','Mombasa','Kisumu','Nakuru','Kiambu',
  'Machakos','Kajiado','Uasin Gishu','Meru','Nyeri'
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

  // ✅ FIX 1: Only check existing app IF user is logged in
  useEffect(() => {
    const loadExistingApplication = async () => {
      const token = getAccessToken();

      // 🚫 If no token → new session → allow fresh application
      if (!token) return;

        try {
          const existing = await getVendorApplication();

          // Type guard: check if 'status' exists on 'existing'
          const currentStatus =
            existing && typeof existing === 'object' && 'status' in existing
              ? String((existing as { status?: string }).status || 'draft').toLowerCase()
              : 'draft';

          if (["submitted", "approved", "pending"].includes(currentStatus)) {
            setStatus('submitted');
          }
        } catch {
          // ignore
        }
    };

    void loadExistingApplication();
  }, []);

  // ✅ RESET FUNCTION (KEY FEATURE)
  const startNewApplication = () => {
    clearAccessToken(); // 🔥 wipe old session

    setStatus('draft');
    setStep(1);

    setBusinessName('');
    setBusinessEmail('');
    setBusinessPhone('');
    setTaxId('');
    setCounty('');
    setUsername('');
    setPassword('');
    setPasswordConfirm('');

    toast.success('You can now submit a new application.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== passwordConfirm) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      // ✅ Register new user (new identity)
      const registerResponse = await registerVendorAccount({
        username: username.trim(),
        email: businessEmail.trim().toLowerCase(),
        password,
        role: 'vendor',
        first_name: businessName.split(' ')[0] || '',
        last_name: businessName.split(' ').slice(1).join(' ') || ''
      });

      const accessToken = extractAccessToken(registerResponse);

      if (!accessToken) {
        throw new Error('No access token returned.');
      }

      setAccessToken(accessToken);

      // ✅ Submit application
      await submitVendorApplication({
        business_name: businessName.trim(),
        business_email: businessEmail.trim().toLowerCase(),
        business_phone: businessPhone.trim(),
        tax_id: taxId.trim(),
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
          : 'Submission failed';

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ SUCCESS SCREEN (WITH RESET BUTTON 🔥)
  if (status === 'submitted') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card p-8 text-center max-w-md w-full">

          <CheckCircle2 size={40} className="mx-auto text-green-600 mb-4" />

          <h2 className="text-xl font-bold mb-2">Application Submitted</h2>

          <p className="mb-6 text-gray-600">
            Your application is under review.
          </p>

          <div className="space-y-3">
            <Link to="/login" className="btn-primary w-full">
              Go to Login
            </Link>

            {/* 🔥 NEW FEATURE */}
            <button
              onClick={startNewApplication}
              className="btn-secondary w-full"
            >
              Submit Another Application
            </button>
          </div>

        </div>
      </div>
    );
  }

  // FORM UI
  return (
    <div className="min-h-screen flex flex-col">

      <header className="p-4 border-b flex justify-between">
        <span className="flex items-center gap-2">
          <Store /> TradeLink
        </span>

        <Link to="/login">Login</Link>
      </header>

      <main className="max-w-xl mx-auto w-full p-4">

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">

          {step === 1 && (
            <>
              <input placeholder="Business Name" value={businessName} onChange={e => setBusinessName(e.target.value)} required />
              <input type="email" placeholder="Email" value={businessEmail} onChange={e => setBusinessEmail(e.target.value)} required />
              <input placeholder="Phone" value={businessPhone} onChange={e => setBusinessPhone(e.target.value)} required />

              <select value={county} onChange={e => setCounty(e.target.value)} required>
                <option value="">Select County</option>
                {KENYA_COUNTIES.map(c => <option key={c}>{c}</option>)}
              </select>

              <button type="button" onClick={() => setStep(2)}>Next</button>
            </>
          )}

          {step === 2 && (
            <>
              <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
              <input type="password" placeholder="Confirm" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} required />
              <input placeholder="Tax ID" value={taxId} onChange={e => setTaxId(e.target.value)} required />

              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(1)}>Back</button>
                <button type="button" onClick={() => setStep(3)}>Next</button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <p>{businessName}</p>
              <p>{businessEmail}</p>

              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(2)}>Back</button>
                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </>
          )}

        </form>
      </main>
    </div>
  );
}