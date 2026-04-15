const STORE_NAME_KEY = 'vendor_store_name';
const VENDOR_NAME_KEY = 'vendor_display_name';
const VENDOR_ID_KEY = 'vendor_user_id';

export interface VendorSession {
  storeName: string;
  vendorName: string;
  vendorId: string;
}

export function saveVendorSession(session: Partial<VendorSession>): void {
  if (session.storeName !== undefined) {
    localStorage.setItem(STORE_NAME_KEY, session.storeName);
  }
  if (session.vendorName !== undefined) {
    localStorage.setItem(VENDOR_NAME_KEY, session.vendorName);
  }
  if (session.vendorId !== undefined) {
    localStorage.setItem(VENDOR_ID_KEY, session.vendorId);
  }
}

export function getVendorSession(): VendorSession {
  return {
    storeName: localStorage.getItem(STORE_NAME_KEY) || 'Your Store',
    vendorName: localStorage.getItem(VENDOR_NAME_KEY) || 'Vendor User',
    vendorId: localStorage.getItem(VENDOR_ID_KEY) || 'N/A'
  };
}

export function clearVendorSession(): void {
  localStorage.removeItem(STORE_NAME_KEY);
  localStorage.removeItem(VENDOR_NAME_KEY);
  localStorage.removeItem(VENDOR_ID_KEY);
}
