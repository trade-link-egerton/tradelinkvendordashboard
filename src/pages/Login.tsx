import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, ArrowRight, ShieldCheck } from 'lucide-react';
export function Login() {
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('otp');
  };
  const handleOTP = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, verify OTP then navigate
    navigate('/');
  };
  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="bg-brand-700 text-white p-2 rounded-xl">
            <Store size={32} />
          </div>
          <span className="font-heading font-bold text-3xl text-[var(--text-primary)]">
            TradeLink
          </span>
        </div>

        {/* Card */}
        <div className="card p-8">
          {step === 'credentials' ?
          <div className="animate-in fade-in zoom-in-95">
              <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)] mb-2">
                Welcome back
              </h1>
              <p className="text-[var(--text-secondary)] mb-6">
                Log in to your vendor dashboard.
              </p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Email Address
                  </label>
                  <input
                  type="email"
                  className="input-field"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required />
                
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-[var(--text-primary)]">
                      Password
                    </label>
                    <a
                    href="#"
                    className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                    
                      Forgot password?
                    </a>
                  </div>
                  <input
                  type="password"
                  className="input-field"
                  placeholder="••••••••"
                  required />
                
                </div>

                <button type="submit" className="btn-primary w-full mt-6">
                  Log In
                </button>
              </form>
            </div> :

          <div className="animate-in fade-in slide-in-from-right-4">
              <div className="w-12 h-12 bg-brand-50 dark:bg-brand-900/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                <ShieldCheck
                className="text-brand-600 dark:text-brand-400"
                size={24} />
              
              </div>
              <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)] mb-2 text-center">
                Two-Step Verification
              </h1>
              <p className="text-[var(--text-secondary)] mb-6 text-center text-sm">
                We've sent a 6-digit code to{' '}
                <strong>{email || 'your email'}</strong>.
              </p>

              <form onSubmit={handleOTP} className="space-y-6">
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5, 6].map((i) =>
                <input
                  key={i}
                  type="text"
                  maxLength={1}
                  className="w-12 h-14 text-center text-xl font-mono font-bold bg-transparent border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-[var(--text-primary)]" />

                )}
                </div>

                <button type="submit" className="btn-primary w-full">
                  Verify & Continue <ArrowRight size={16} />
                </button>

                <p className="text-center text-sm text-[var(--text-secondary)]">
                  Didn't receive the code?{' '}
                  <button
                  type="button"
                  className="text-brand-600 font-medium ml-1">
                  
                    Resend
                  </button>
                </p>
              </form>
            </div>
          }
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center text-sm text-[var(--text-secondary)]">
          Don't have a vendor account?{' '}
          <Link
            to="/apply"
            className="text-brand-600 font-medium hover:text-brand-700">
            
            Apply now
          </Link>
        </div>
      </div>
    </div>);

}