import React, { useEffect, useState } from 'react';
import { Save, Store } from 'lucide-react';
import { toast } from 'sonner';
import {
  getSettings,
  getStoreProfile,
  StoreProfile,
  updateSettings,
  updateStoreProfile
} from '../lib/vendorApi';
import { saveVendorSession } from '../lib/session';

export function Settings() {
  const [storeProfile, setStoreProfile] = useState<StoreProfile>({
    name: '',
    description: '',
    support_email: '',
    support_phone: '',
    logo_url: ''
  });
  const [notificationEmail, setNotificationEmail] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [store, settings] = await Promise.all([getStoreProfile(), getSettings()]);

        setStoreProfile({
          name: store.name || '',
          description: store.description || '',
          support_email: store.support_email || '',
          support_phone: store.support_phone || '',
          logo_url: store.logo_url || ''
        });

        if (typeof settings.email_notifications === 'boolean') {
          setNotificationEmail(settings.email_notifications);
        }
      } catch {
        toast.error('Failed to load settings.');
      }
    };

    void loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);

    try {
      const [updatedStore] = await Promise.all([
        updateStoreProfile(storeProfile),
        updateSettings({ email_notifications: notificationEmail })
      ]);

      saveVendorSession({ storeName: updatedStore.name || storeProfile.name || 'Your Store' });
      toast.success('Settings updated successfully.');
    } catch {
      toast.error('Unable to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)]">Store Settings</h1>
        <p className="text-[var(--text-secondary)]">Manage your store profile and preferences.</p>
      </div>

      <div className="card p-6 space-y-6">
        <h2 className="text-lg font-heading font-semibold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-3 mb-2">
          <Store className="inline mr-2" size={18} /> Store Profile
        </h2>

        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Store Name</label>
          <input
            type="text"
            className="input-field"
            value={storeProfile.name || ''}
            onChange={(e) => setStoreProfile((prev) => ({ ...prev, name: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Store Description</label>
          <textarea
            className="input-field min-h-[100px]"
            value={storeProfile.description || ''}
            onChange={(e) => setStoreProfile((prev) => ({ ...prev, description: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Support Email</label>
            <input
              type="email"
              className="input-field"
              value={storeProfile.support_email || ''}
              onChange={(e) => setStoreProfile((prev) => ({ ...prev, support_email: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Support Phone</label>
            <input
              type="tel"
              className="input-field"
              value={storeProfile.support_phone || ''}
              onChange={(e) => setStoreProfile((prev) => ({ ...prev, support_phone: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Notifications</label>
          <label className="flex items-center gap-3 text-sm text-[var(--text-primary)]">
            <input
              type="checkbox"
              checked={notificationEmail}
              onChange={(e) => setNotificationEmail(e.target.checked)}
            />
            Receive order and payout notifications via email
          </label>
        </div>

        <div className="mt-2 flex justify-end">
          <button className="btn-primary" onClick={() => void handleSave()} disabled={saving}>
            <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
