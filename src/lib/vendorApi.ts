import { apiRequest, extractList } from './api';

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

export interface RegisterVendorPayload {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  role: 'vendor';
}

export function extractAccessToken(payload: LoginResponse | RegisterResponse): string | null {
  const topLevelToken =
    payload.access_token || payload.accessToken || payload.token || payload.access || payload.jwt;

  if (topLevelToken) {
    return topLevelToken;
  }

  if ('tokens' in payload && payload.tokens?.access) {
    return payload.tokens.access;
  }

  const nestedToken =
    payload.data?.access_token ||
    payload.data?.accessToken ||
    payload.data?.token ||
    payload.data?.access ||
    payload.data?.jwt;

  return nestedToken || null;
}

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
  topProducts: Array<Record<string, unknown>>;
  recentOrders: Array<Record<string, unknown>>;
}

export interface Product {
  id: string;
  name: string;
  category_name?: string;
  category_id?: string;
  price: number;
  stock_quantity: number;
  image_url?: string;
  status?: ProductStatus;
  is_published?: boolean;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  product_count?: number;
  children?: Category[];
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

export interface Wallet {
  available_balance?: number;
  pending_balance?: number;
}

export interface RevenuePoint {
  label: string;
  value: number;
}

export function listProducts(params?: Record<string, string | number | boolean | undefined>): Promise<Product[]> {
  return apiRequest<unknown>('/products/', { params }).then((payload) => extractList<Product>(payload));
}

export function getProduct(id: string): Promise<Product> {
  return apiRequest<Product>(`/products/${id}/`);
}

export function createProduct(body: Partial<Product>): Promise<Product> {
  return apiRequest<Product>('/products/', { method: 'POST', body });
}

export function updateProduct(id: string, body: Partial<Product>): Promise<Product> {
  return apiRequest<Product>(`/products/${id}/`, { method: 'PATCH', body });
}

export function deleteProduct(id: string): Promise<void> {
  return apiRequest<void>(`/products/${id}/`, { method: 'DELETE' });
}

export function getDashboardSummary(): Promise<DashboardSummary> {
  return apiRequest<DashboardSummary>('/dashboard/summary');
}

export function getLowStock(threshold?: number): Promise<Array<Record<string, unknown>>> {
  return apiRequest<unknown>('/inventory/low-stock/', { params: { threshold } }).then((payload) => extractList<Record<string, unknown>>(payload));
}

export async function getRevenueSeries(params?: Record<string, string>): Promise<RevenuePoint[]> {
  const payload = await apiRequest<unknown>('/reports/revenue', { params });
  const list = extractList<Record<string, unknown>>(payload);

  if (list.length > 0) {
    return list.map((item, index) => {
      const label = typeof item.label === 'string' ? item.label : typeof item.name === 'string' ? item.name : `P${index + 1}`;
      const rawValue = item.value ?? item.amount ?? item.total ?? 0;
      const value = typeof rawValue === 'number' ? rawValue : Number(rawValue) || 0;
      return { label, value };
    });
  }

  return [];
}

export function listCategories(): Promise<Category[]> {
  return apiRequest<unknown>('/categories/').then((payload) => extractList<Category>(payload));
}

export function getCategoryTree(): Promise<Category[]> {
  return apiRequest<unknown>('/categories/tree/').then((payload) => extractList<Category>(payload));
}

export function createCategory(body: Partial<Category>): Promise<Category> {
  return apiRequest<Category>('/categories/', { method: 'POST', body });
}

export function deleteCategory(id: string): Promise<void> {
  return apiRequest<void>(`/categories/${id}/`, { method: 'DELETE' });
}

export function listOrders(params?: Record<string, string | number | boolean | undefined>): Promise<Order[]> {
  return apiRequest<unknown>('/orders/', { params }).then((payload) => extractList<Order>(payload));
}

export function getOrder(id: string): Promise<Record<string, unknown>> {
  return apiRequest<Record<string, unknown>>(`/orders/${id}/`);
}

export function updateOrderStatus(id: string, status: string): Promise<Record<string, unknown>> {
  return apiRequest<Record<string, unknown>>(`/orders/${id}/status/`, { method: 'PATCH', body: { status } });
}

export function cancelOrder(id: string): Promise<Record<string, unknown>> {
  return apiRequest<Record<string, unknown>>(`/orders/${id}/cancel/`, { method: 'POST' });
}

export function listPayouts(): Promise<Payout[]> {
  return apiRequest<unknown>('/payouts').then((payload) => extractList<Payout>(payload));
}

export function getWallet(): Promise<Wallet> {
  return apiRequest<Wallet>('/wallet');
}

export function getOrdersReport(params?: Record<string, string>): Promise<Record<string, unknown>> {
  return apiRequest<Record<string, unknown>>('/reports/orders', { params });
}

export function getProductsReport(params?: Record<string, string>): Promise<Record<string, unknown>> {
  return apiRequest<Record<string, unknown>>('/reports/products', { params });
}

export function getSettings(): Promise<Record<string, unknown>> {
  return apiRequest<Record<string, unknown>>('/settings');
}

export function updateSettings(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  return apiRequest<Record<string, unknown>>('/settings', { method: 'PATCH', body });
}

export function getStoreProfile(): Promise<StoreProfile> {
  return apiRequest<StoreProfile>('/store');
}

export function updateStoreProfile(body: Partial<StoreProfile>): Promise<StoreProfile> {
  return apiRequest<StoreProfile>('/store', { method: 'PATCH', body });
}

export function getVendorProfile(): Promise<VendorProfile> {
  return apiRequest<VendorProfile>('/vendors/me');
}

export function loginVendor(email: string, password: string): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/login/', {
    method: 'POST',
    body: { email, password },
    skipAuth: true
  });
}

export function registerVendorAccount(body: RegisterVendorPayload): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>('/auth/register/', {
    method: 'POST',
    body,
    skipAuth: true
  });
}

export function submitVendorApplication(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  return apiRequest<Record<string, unknown>>('/vendors/apply', { method: 'POST', body });
}

export function getVendorApplication(): Promise<Record<string, unknown>> {
  return apiRequest<Record<string, unknown>>('/vendors/application');
}
