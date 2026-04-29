import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

import { ApiError } from '../lib/api';
import { setAccessToken } from '../lib/auth';
import { saveVendorSession } from '../lib/session';

import {
  extractAccessToken,
  getStoreProfile,
  getVendorProfile,
  loginVendor
} from '../lib/vendorApi';

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
      // 1. LOGIN
      const authPayload = await loginVendor(email.trim(), password);
      const token = extractAccessToken(authPayload);

      if (!token) {
        throw new Error('No access token returned from backend.');
      }

      // 2. SAVE TOKEN FIRST (critical fix)
      setAccessToken(token);

      // 3. DEFAULT SESSION (safe fallback)
      let vendorName = 'Vendor User';
      let vendorId = 'N/A';
      let storeName = 'Your Store';

      // 4. TRY FETCH PROFILE (optional, never block login)
      try {
        const vendor = await getVendorProfile();
        const store = await getStoreProfile().catch(() => ({} as any));

        vendorName = vendor?.business_name || vendor?.username || 'Vendor User';
        vendorId = vendor?.user_id || vendor?.id || 'N/A';
        storeName = store?.name || vendorName || 'Your Store';
      } catch (err) {
        console.warn('Profile fetch failed, using fallback session', err);
      }

      // 5. SAVE SESSION ALWAYS
      saveVendorSession({
        vendorName,
        vendorId,
        storeName
      });

      toast.success(`Welcome back, ${vendorName}`);

      // 6. NAVIGATE
      navigate('/', { replace: true });

    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.detail
          : error instanceof Error
          ? error.message
          : 'Login failed. Please try again.';

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* HEADER */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="bg-brand-700 text-white p-2 rounded-xl">
            <Store size={32} />
          </div>
          <span className="font-heading font-bold text-3xl text-[var(--text-primary)]">
            TradeLink
          </span>
        </div>

        {/* LOGIN CARD */}
        <div className="card p-8">
          <div className="text-center mb-4">
            <ShieldCheck className="mx-auto text-brand-600" size={28} />
            <h1 className="text-2xl font-bold mt-2">Vendor Login</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Sign in to access your dashboard
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">

            <input
              type="email"
              className="input-field"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              className="input-field"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
              <ArrowRight size={16} />
            </button>
          </form>
        </div>

        {/* FOOTER */}
        <p className="text-center mt-6 text-sm text-[var(--text-secondary)]">
          No account?{' '}
          <Link to="/apply" className="text-brand-600 font-medium">
            Apply as vendor
          </Link>
        </p>

      </div>
    </div>
  );
}