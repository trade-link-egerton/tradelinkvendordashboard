import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, CheckCircle2, ArrowRight, ArrowLeft, Loader2, MapPin, Building2, Mail, Phone, User, Lock, FileText } from 'lucide-react';
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

  useEffect(() => {
    const loadExistingApplication = async () => {
      const token = getAccessToken();
      if (!token) return;

      try {
        const existing = await getVendorApplication();
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

  const startNewApplication = () => {
    clearAccessToken();
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

  const steps = [
    { num: 1, label: 'Business Info' },
    { num: 2, label: 'Account Setup' },
    { num: 3, label: 'Review' }
  ];

  if (status === 'submitted') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md w-full border border-gray-100">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Application Submitted</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Thank you for your application. Our team will review your details and get back to you shortly.
          </p>

          <div className="space-y-3">
            <Link 
              to="/login" 
              className="inline-flex items-center justify-center w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Go to Login
            </Link>

            <button
              onClick={startNewApplication}
              className="inline-flex items-center justify-center w-full px-6 py-3 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              Submit Another Application
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 text-gray-900 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <Store className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight">TradeLink</span>
          </Link>

          <Link 
            to="/login" 
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            Sign In
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-xl">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendor Application</h1>
            <p className="text-gray-500">Complete the steps below to register your business</p>
          </div>

          {/* Stepper */}
          <div className="mb-8">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2" />
              <div 
                className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -translate-y-1/2 transition-all duration-500"
                style={{ width: `${((step - 1) / 2) * 100}%` }}
              />
              
              {steps.map((s) => (
                <div key={s.num} className="relative flex flex-col items-center gap-2 bg-gray-50 px-2">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                      step > s.num 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : step === s.num 
                        ? 'bg-white border-blue-600 text-blue-600 ring-4 ring-blue-50' 
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}
                  >
                    {step > s.num ? <CheckCircle2 size={18} /> : s.num}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${
                    step >= s.num ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 space-y-6">
            
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Building2 size={16} className="text-gray-400" />
                    Business Name
                  </label>
                  <input 
                    placeholder="e.g. ABC Enterprises Ltd"
                    value={businessName} 
                    onChange={e => setBusinessName(e.target.value)} 
                    required 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Mail size={16} className="text-gray-400" />
                    Business Email
                  </label>
                  <input 
                    type="email" 
                    placeholder="contact@yourbusiness.com"
                    value={businessEmail} 
                    onChange={e => setBusinessEmail(e.target.value)} 
                    required 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Phone size={16} className="text-gray-400" />
                    Phone Number
                  </label>
                  <input 
                    placeholder="+254 700 000 000"
                    value={businessPhone} 
                    onChange={e => setBusinessPhone(e.target.value)} 
                    required 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <MapPin size={16} className="text-gray-400" />
                    County
                  </label>
                  <select 
                    value={county} 
                    onChange={e => setCounty(e.target.value)} 
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select your county</option>
                    {KENYA_COUNTIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <button 
                  type="button" 
                  onClick={() => setStep(2)}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-2"
                >
                  Continue
                  <ArrowRight size={18} />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <User size={16} className="text-gray-400" />
                    Username
                  </label>
                  <input 
                    placeholder="Choose a username"
                    value={username} 
                    onChange={e => setUsername(e.target.value)} 
                    required 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Lock size={16} className="text-gray-400" />
                    Password
                  </label>
                  <input 
                    type="password" 
                    placeholder="Create a strong password"
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Lock size={16} className="text-gray-400" />
                    Confirm Password
                  </label>
                  <input 
                    type="password" 
                    placeholder="Re-enter your password"
                    value={passwordConfirm} 
                    onChange={e => setPasswordConfirm(e.target.value)} 
                    required 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FileText size={16} className="text-gray-400" />
                    Tax ID / PIN
                  </label>
                  <input 
                    placeholder="e.g. A001234567F"
                    value={taxId} 
                    onChange={e => setTaxId(e.target.value)} 
                    required 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setStep(1)}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                  >
                    <ArrowLeft size={18} />
                    Back
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setStep(3)}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Review
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-gray-50 rounded-xl p-6 space-y-4 border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Application Summary</h3>
                  
                  <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                    <span className="text-gray-500">Business</span>
                    <span className="font-medium text-gray-900">{businessName}</span>
                    
                    <span className="text-gray-500">Email</span>
                    <span className="font-medium text-gray-900">{businessEmail}</span>
                    
                    <span className="text-gray-500">Phone</span>
                    <span className="font-medium text-gray-900">{businessPhone}</span>
                    
                    <span className="text-gray-500">County</span>
                    <span className="font-medium text-gray-900">{county}</span>
                    
                    <span className="text-gray-500">Username</span>
                    <span className="font-medium text-gray-900">{username}</span>
                    
                    <span className="text-gray-500">Tax ID</span>
                    <span className="font-medium text-gray-900">{taxId}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-500 text-center">
                  By submitting, you agree to our terms of service and vendor policies.
                </p>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setStep(2)}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                  >
                    <ArrowLeft size={18} />
                    Back
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Application
                        <CheckCircle2 size={18} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Need help? <Link to="/support" className="text-blue-600 hover:underline">Contact support</Link>
          </p>
        </div>
      </main>
    </div>
  );
}