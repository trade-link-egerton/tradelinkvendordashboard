import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Store,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  MapPin,
  Building2,
  Mail,
  Phone,
  User,
  Lock,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

import { ApiError } from '../lib/api';
import {
  setAccessToken,
  setRefreshToken,
  clearAuthTokens
} from '../lib/auth';
import { registerVendorAccount } from '../lib/vendorApi';

type Step = 1 | 2 | 3;
type Status = 'draft' | 'submitted';
type Gender = 'M' | 'F';
type VendorType = 'individual' | 'business';

interface VendorFormData {
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  taxId: string;
  county: string;
  username: string;
  password: string;
  passwordConfirm: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  vendorType: VendorType;
  verificationDocUrl: string;
}

interface VendorRegistrationPayload {
  email: string;
  username: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  gender: Gender;
  vendor_type: VendorType;
  business_name: string;
  verification_doc_url: string;
}

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

const INITIAL_FORM_DATA: VendorFormData = {
  businessName: '',
  businessEmail: '',
  businessPhone: '',
  taxId: '',
  county: '',
  username: '',
  password: '',
  passwordConfirm: '',
  firstName: '',
  lastName: '',
  gender: 'M',
  vendorType: 'individual',
  verificationDocUrl: ''
};

const inputBaseClass =
  'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all';

const labelClass =
  'text-sm font-semibold text-gray-700 flex items-center gap-2';

export function VendorApplication() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>(1);
  const [status, setStatus] = useState<Status>('draft');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] =
    useState<VendorFormData>(INITIAL_FORM_DATA);

  const steps = useMemo(
    () => [
      { num: 1, label: 'Business Info' },
      { num: 2, label: 'Account Setup' },
      { num: 3, label: 'Review' }
    ],
    []
  );

  const updateField = <K extends keyof VendorFormData>(
    field: K,
    value: VendorFormData[K]
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    clearAuthTokens();
    setFormData(INITIAL_FORM_DATA);
    setStatus('draft');
    setStep(1);
    toast.success('You can now submit a new vendor application.');
  };

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePhone = (phone: string) =>
    /^[+]?[0-9\s\-]{10,15}$/.test(phone);

  const validateStepOne = (): boolean => {
    if (
      !formData.businessName.trim() ||
      !formData.businessEmail.trim() ||
      !formData.businessPhone.trim() ||
      !formData.county
    ) {
      toast.error('Please complete all business details.');
      return false;
    }

    if (!validateEmail(formData.businessEmail)) {
      toast.error('Please enter a valid business email.');
      return false;
    }

    if (!validatePhone(formData.businessPhone)) {
      toast.error('Please enter a valid phone number.');
      return false;
    }

    return true;
  };

  const validateStepTwo = (): boolean => {
    if (
      !formData.username.trim() ||
      !formData.password ||
      !formData.passwordConfirm ||
      !formData.taxId.trim()
    ) {
      toast.error('Please complete all account setup details.');
      return false;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return false;
    }

    if (formData.password !== formData.passwordConfirm) {
      toast.error('Passwords do not match.');
      return false;
    }

    return true;
  };

  const buildPayload = (): VendorRegistrationPayload => {
    const fallbackFirstName =
      formData.businessName.trim().split(' ')[0] || 'Vendor';

    const fallbackLastName =
      formData.businessName.trim().split(' ').slice(1).join(' ') || 'Business';

    return {
      email: formData.businessEmail.trim().toLowerCase(),
      username: formData.username.trim(),
      password: formData.password,
      password_confirm: formData.passwordConfirm,
      first_name: formData.firstName.trim() || fallbackFirstName,
      last_name: formData.lastName.trim() || fallbackLastName,
      phone_number: formData.businessPhone.trim(),
      gender: formData.gender,
      vendor_type: formData.vendorType,
      business_name: formData.businessName.trim(),
      verification_doc_url:
        formData.verificationDocUrl.trim() ||
        `Tax ID: ${formData.taxId.trim()} | County: ${formData.county}`
    };
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (!validateStepTwo()) return;

    setIsSubmitting(true);

    try {
      const payload = buildPayload();
      const response = await registerVendorAccount(payload);

      if (!response?.tokens?.access || !response?.tokens?.refresh) {
        throw new Error('Authentication tokens were not returned.');
      }

      setAccessToken(response.tokens.access);
      setRefreshToken(response.tokens.refresh);

      setStatus('submitted');

      toast.success(
        response.message ||
          'Vendor account created successfully. Awaiting admin verification.'
      );
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.detail
          : error instanceof Error
          ? error.message
          : 'Vendor registration failed';

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'submitted') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md w-full border border-gray-100">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-green-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Application Submitted
          </h2>

          <p className="text-gray-500 mb-8 leading-relaxed">
            Your vendor account was created successfully and is awaiting
            administrator verification.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/login')}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition"
            >
              Go to Login
            </button>

            <button
              onClick={resetForm}
              className="w-full px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl transition"
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
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-gray-900"
          >
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <Store className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold">TradeLink</span>
          </Link>

          <Link
            to="/login"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Sign In
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Vendor Application
            </h1>
            <p className="text-gray-500">
              Complete the registration process to onboard your business.
            </p>
          </div>

          {/* Stepper */}
          <div className="mb-8 flex justify-between relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200" />

            {steps.map(stepItem => (
              <div
                key={stepItem.num}
                className="relative z-10 flex flex-col items-center"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold border-2 ${
                    step > stepItem.num
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : step === stepItem.num
                      ? 'bg-white border-blue-600 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  {step > stepItem.num ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    stepItem.num
                  )}
                </div>

                <span className="text-xs mt-2 font-medium text-gray-600">
                  {stepItem.label}
                </span>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 space-y-6"
          >
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label className={labelClass}>
                    <Building2 size={16} />
                    Business Name
                  </label>
                  <input
                    className={inputBaseClass}
                    placeholder="ABC Enterprises Ltd"
                    value={formData.businessName}
                    onChange={e =>
                      updateField('businessName', e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    <Mail size={16} />
                    Business Email
                  </label>
                  <input
                    type="email"
                    className={inputBaseClass}
                    placeholder="business@example.com"
                    value={formData.businessEmail}
                    onChange={e =>
                      updateField('businessEmail', e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    <Phone size={16} />
                    Phone Number
                  </label>
                  <input
                    className={inputBaseClass}
                    placeholder="+254700000000"
                    value={formData.businessPhone}
                    onChange={e =>
                      updateField('businessPhone', e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    <MapPin size={16} />
                    County
                  </label>
                  <select
                    className={inputBaseClass}
                    value={formData.county}
                    onChange={e =>
                      updateField('county', e.target.value)
                    }
                  >
                    <option value="">Select County</option>
                    {KENYA_COUNTIES.map(county => (
                      <option key={county} value={county}>
                        {county}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    validateStepOne() && setStep(2)
                  }
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                >
                  Continue
                  <ArrowRight size={18} />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <label className={labelClass}>
                    <User size={16} />
                    Username
                  </label>
                  <input
                    className={inputBaseClass}
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={e =>
                      updateField('username', e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    <Lock size={16} />
                    Password
                  </label>
                  <input
                    type="password"
                    className={inputBaseClass}
                    placeholder="Minimum 8 characters"
                    value={formData.password}
                    onChange={e =>
                      updateField('password', e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    <Lock size={16} />
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    className={inputBaseClass}
                    placeholder="Re-enter password"
                    value={formData.passwordConfirm}
                    onChange={e =>
                      updateField(
                        'passwordConfirm',
                        e.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    <FileText size={16} />
                    Tax ID / PIN
                  </label>
                  <input
                    className={inputBaseClass}
                    placeholder="A001234567X"
                    value={formData.taxId}
                    onChange={e =>
                      updateField('taxId', e.target.value)
                    }
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 px-6 py-3 bg-gray-100 rounded-xl"
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      validateStepTwo() && setStep(3)
                    }
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl"
                  >
                    Review
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6 border">
                  <h3 className="font-semibold text-gray-800 mb-4">
                    Application Summary
                  </h3>

                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Business:</strong>{' '}
                      {formData.businessName}
                    </p>
                    <p>
                      <strong>Email:</strong>{' '}
                      {formData.businessEmail}
                    </p>
                    <p>
                      <strong>Phone:</strong>{' '}
                      {formData.businessPhone}
                    </p>
                    <p>
                      <strong>County:</strong> {formData.county}
                    </p>
                    <p>
                      <strong>Username:</strong>{' '}
                      {formData.username}
                    </p>
                    <p>
                      <strong>Tax ID:</strong> {formData.taxId}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 px-6 py-3 bg-gray-100 rounded-xl"
                  >
                    <ArrowLeft className="inline mr-2" size={16} />
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />
                        Submitting...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Submit Application
                        <CheckCircle2 size={18} />
                      </span>
                    )}
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