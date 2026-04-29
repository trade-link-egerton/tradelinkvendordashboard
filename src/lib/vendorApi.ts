import { apiRequest, extractList } from './api';

/* ───────────────────────────────
   AUTH TYPES
─────────────────────────────── */

export interface LoginResponse {
  access_token?: string;
  accessToken?: string;
  token?: string;
  access?: string;
  jwt?: string;
  data?: {
    access_token?: string;
    accessToken?: string;
    token?: string;
    access?: string;
    jwt?: string;
  };
}

export interface Wallet {
  available_balance?: number;
  pending_balance?: number;
}



export interface Order {
  id: string;
  customer_name?: string;
  created_at?: string;
  total_amount?: number;
  items_count?: number;
  status: string;
  payment_status?: string;
}

export interface Payout {
  id: string;
  date?: string;
  created_at?: string;
  amount?: number;
  method?: string;
  status?: string;
}

export function listPayouts(): Promise<Payout[]> {
  return apiRequest<unknown>('/payouts').then((payload) =>
    extractList<Payout>(payload)
  );
}


export function getSettings(): Promise<Record<string, unknown>> {
  return apiRequest('/settings');
}

export function updateSettings(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  return apiRequest('/settings', {
    method: 'PATCH',
    body
  });
}



export function getOrdersReport(params?: Record<string, string>) {
  return apiRequest('/reports/orders', {
    params
  });
}

export function getProductsReport(params?: Record<string, string>) {
  return apiRequest('/reports/products', { params });
}

export function getWallet(): Promise<Wallet> {
  return apiRequest<Wallet>('/wallet');
}

export function getRevenueReport(params?: Record<string, string>) {
  return apiRequest('/reports/revenue', { params });
}
export function createCategory(body: any) {
  return apiRequest('/categories/', {
    method: 'POST',
    body
  });
}

export function listOrders(params?: Record<string, any>) {
  return apiRequest('/orders/', { params }).then(extractList<Order>);
}

export function getOrder(id: string) {
  return apiRequest(`/orders/${id}/`);
}

export function updateOrderStatus(id: string, status: string) {
  return apiRequest(`/orders/${id}/status/`, {
    method: 'PATCH',
    body: { status }
  });
}

export function cancelOrder(id: string) {
  return apiRequest(`/orders/${id}/cancel/`, {
    method: 'POST'
  });
}
export function deleteCategory(id: string) {
  return apiRequest(`/categories/${id}/`, {
    method: 'DELETE'
  });
}
export interface RegisterResponse {
  user?: {
    id?: string;
    username?: string;
    email?: string;
  };
  tokens?: {
    access?: string;
    refresh?: string;
  };
  access_token?: string;
  accessToken?: string;
  token?: string;
  access?: string;
  jwt?: string;
  data?: {
    access_token?: string;
    accessToken?: string;
    token?: string;
    access?: string;
    jwt?: string;
  };
}

/* ───────────────────────────────
   REGISTER
─────────────────────────────── */

export interface RegisterVendorPayload {
  username: string;
  email: string;
  password: string;
  role: 'vendor';
  first_name?: string;
  last_name?: string;
}

/* ───────────────────────────────
   TOKEN EXTRACTION
─────────────────────────────── */

export function extractAccessToken(payload: any): string | null {
  if (!payload) return null;

  return (
    payload?.access_token ||
    payload?.accessToken ||
    payload?.access ||
    payload?.token ||
    payload?.jwt ||
    payload?.data?.access_token ||
    payload?.data?.access ||
    payload?.data?.token ||
    payload?.data?.jwt ||
    payload?.tokens?.access ||
    payload?.tokens?.access_token ||
    payload?.tokens?.token ||
    null
  );
}

/* ───────────────────────────────
   CLEAN PAYLOAD
─────────────────────────────── */

export function normalizeRegisterPayload(payload: RegisterVendorPayload) {
  return {
    ...payload,
    username: payload.username?.trim(),
    email: payload.email?.trim().toLowerCase(),
    first_name: payload.first_name?.trim() || '',
    last_name: payload.last_name?.trim() || ''
  };
}

/* ───────────────────────────────
   TYPES
─────────────────────────────── */

export type ProductStatus = 'active' | 'draft' | 'archived';

export interface VendorProfile {
  user_id?: string;
  id?: string;
  business_name?: string;
  business_email?: string;
  business_phone?: string;
  status?: string;
}

export interface StoreProfile {
  name?: string;
  description?: string;
  support_email?: string;
  support_phone?: string;
  logo_url?: string;
}

export interface DashboardSummary {
  revenueToday: number;
  ordersToday: number;
  pendingOrders: number;
  lowStockCount: number;
  topProducts: any[];
  recentOrders: any[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  image_url?: string;
  status?: ProductStatus;
}

/* ───────────────────────────────
   PRODUCTS
─────────────────────────────── */

export function listProducts(params?: Record<string, any>) {
  return apiRequest<unknown>('/products/', { params }).then(extractList<Product>);
}

export function getProduct(id: string) {
  return apiRequest<Product>(`/products/${id}/`);
}

export function createProduct(body: Partial<Product>) {
  return apiRequest<Product>('/products/', { method: 'POST', body });
}

export function updateProduct(id: string, body: Partial<Product>) {
  return apiRequest<Product>(`/products/${id}/`, { method: 'PATCH', body });
}

export function deleteProduct(id: string) {
  return apiRequest(`/products/${id}/`, { method: 'DELETE' });
}

/* ───────────────────────────────
   DASHBOARD
─────────────────────────────── */

export function getDashboardSummary() {
  return apiRequest<DashboardSummary>('/dashboard/summary');
}

export function getLowStock(threshold?: number) {
  return apiRequest('/inventory/low-stock/', {
    params: { threshold }
  }).then(extractList);
}

/* ───────────────────────────────
   REPORTS
─────────────────────────────── */

export function getRevenueSeries(params?: Record<string, string>) {
  return apiRequest('/reports/revenue', { params }).then((res) => {
    const list = extractList<any>(res);

    return list.map((item, i) => ({
      label: item.label || item.name || `P${i + 1}`,
      value: Number(item.value || item.amount || item.total || 0)
    }));
  });
}

/* ───────────────────────────────
   AUTH
─────────────────────────────── */

export function loginVendor(email: string, password: string) {
  return apiRequest<LoginResponse>('/auth/login/', {
    method: 'POST',
    body: { email, password },
    skipAuth: true
  });
}

export function registerVendorAccount(body: RegisterVendorPayload) {
  return apiRequest<RegisterResponse>('/auth/register/', {
    method: 'POST',
    body: normalizeRegisterPayload(body),
    skipAuth: true
  });
}

/* ───────────────────────────────
   VENDOR APPLICATION
─────────────────────────────── */

export function submitVendorApplication(body: Record<string, any>) {
  return apiRequest('/vendors/apply', {
    method: 'POST',
    body
  });
}

export function getVendorApplication() {
  return apiRequest('/vendors/application');
}

/* ───────────────────────────────
   STORE
─────────────────────────────── */

export function getStoreProfile() {
  return apiRequest<StoreProfile>('/store');
}

export function updateStoreProfile(body: Partial<StoreProfile>) {
  return apiRequest<StoreProfile>('/store', {
    method: 'PATCH',
    body
  });
}

export function getVendorProfile() {
  return apiRequest<VendorProfile>('/vendors/me');
}

/* ───────────────────────────────
   🔥 FIX FOR YOUR ERROR
   (THIS WAS MISSING → CAUSED WHITE SCREEN)
─────────────────────────────── */

export function listCategories() {
  return apiRequest('/categories/').then(extractList);
}

export function getCategoryTree() {
  return apiRequest('/categories/tree/').then(extractList);
}