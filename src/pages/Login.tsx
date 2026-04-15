import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { ApiError } from '../lib/api';
import { setAccessToken } from '../lib/auth';
import { saveVendorSession } from '../lib/session';
import { extractAccessToken, getStoreProfile, getVendorProfile, loginVendor } from '../lib/vendorApi';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error('Email and password are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const authPayload = await loginVendor(email.trim(), password);
      const token = extractAccessToken(authPayload);

      if (!token) {
        throw new Error('Authentication succeeded but no access token was returned.');
      }

      setAccessToken(token);

      const [vendor, store] = await Promise.all([
        getVendorProfile(),
        getStoreProfile().catch(() => ({}))
      ]);

      saveVendorSession({
        vendorName: vendor.business_name || 'Vendor User',
        vendorId: vendor.user_id || vendor.id || 'N/A',
        storeName: store.name || vendor.business_name || 'Your Store'
      });

      toast.success('Login successful.');
      navigate('/');
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.detail
          : error instanceof Error
            ? error.message
            : 'Unable to log in. Please try again.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="bg-brand-700 text-white p-2 rounded-xl">
            <Store size={32} />
          </div>
          <span className="font-heading font-bold text-3xl text-[var(--text-primary)]">
            TradeLink
          </span>
        </div>

        <div className="card p-8 animate-in fade-in zoom-in-95">
          <div className="w-12 h-12 bg-brand-50 dark:bg-brand-900/20 rounded-full flex items-center justify-center mb-4 mx-auto">
            <ShieldCheck className="text-brand-600 dark:text-brand-400" size={24} />
          </div>
          <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)] mb-2 text-center">
            Vendor Dashboard Login
          </h1>
          <p className="text-[var(--text-secondary)] mb-6 text-center text-sm">
            Sign in with your vendor account credentials.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Email
              </label>
              <input
                className="input-field"
                type="email"
                autoComplete="email"
                placeholder="you@business.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Password
              </label>
              <input
                className="input-field"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary w-full mt-6" disabled={isSubmitting}>
              {isSubmitting ? 'Verifying...' : 'Log In'} <ArrowRight size={16} />
            </button>
          </form>
        </div>

        <div className="mt-8 text-center text-sm text-[var(--text-secondary)]">
          Don&apos;t have a vendor account?{' '}
          <Link to="/apply" className="text-brand-600 font-medium hover:text-brand-700">
            Apply now
          </Link>
        </div>
      </div>
    </div>
  );
}
