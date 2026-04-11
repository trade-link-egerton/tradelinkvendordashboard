import React from 'react';
import { Save, Store, MapPin, Bell, Shield } from 'lucide-react';
import { FileUpload } from '../components/shared/FileUpload';
export function Settings() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)]">
          Store Settings
        </h1>
        <p className="text-[var(--text-secondary)]">
          Manage your store profile and preferences.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <div className="card p-2">
            <nav className="space-y-1">
              <a
                href="#profile"
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                
                <Store size={18} /> Store Profile
              </a>
              <a
                href="#address"
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]">
                
                <MapPin size={18} /> Business Address
              </a>
              <a
                href="#notifications"
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]">
                
                <Bell size={18} /> Notifications
              </a>
              <a
                href="#security"
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]">
                
                <Shield size={18} /> Security
              </a>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {/* Store Profile */}
          <div id="profile" className="card p-6">
            <h2 className="text-lg font-heading font-semibold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-3 mb-6">
              Store Profile
            </h2>

            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-[var(--bg-secondary)] rounded-full border border-[var(--border-color)] flex items-center justify-center overflow-hidden shrink-0">
                  <span className="text-2xl font-bold text-[var(--text-secondary)]">
                    NE
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[var(--text-primary)] mb-2">
                    Store Logo
                  </h3>
                  <button className="btn-secondary py-1.5 text-sm">
                    Upload New Logo
                  </button>
                  <p className="text-xs text-[var(--text-secondary)] mt-2">
                    JPG, GIF or PNG. Max size of 800K
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                  Store Name
                </label>
                <input
                  type="text"
                  className="input-field"
                  defaultValue="Nairobi Electronics Hub" />
                
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                  Store Description
                </label>
                <textarea
                  className="input-field min-h-[100px]"
                  defaultValue="Premium electronics and accessories in Nairobi. Fast delivery and authentic products.">
                </textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                  Support Email
                </label>
                <input
                  type="email"
                  className="input-field"
                  defaultValue="support@nairobitech.co.ke" />
                
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                  Support Phone
                </label>
                <input
                  type="tel"
                  className="input-field"
                  defaultValue="+254 712 345 678" />
                
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button className="btn-primary">
                <Save size={18} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>);

}