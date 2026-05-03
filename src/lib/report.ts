import { apiRequest } from './api';

/* ───────────────────────────────
   REPORTS API CLIENT
   Base URL: /api/reports/
   Auth: Bearer JWT (handled by apiRequest)
─────────────────────────────── */

/* ─── Shared Parameter Types ─── */

export type DateRange = 'today' | '7d' | '30d' | '90d' | 'quarter' | 'year' | 'all' | 'custom';
export type OrderStatus = 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'failed' | 'in_transit';
export type ShippingType = 'all' | 'home' | 'pickup';
export type OrdersSort = 'date' | 'amount_desc' | 'status';
export type ProductsSort = 'qty_desc' | 'qty_asc' | 'revenue_desc';
export type Granularity = 'hourly' | 'daily' | 'weekly' | 'monthly';
export type StockLevel = 'all' | 'low' | 'out' | 'healthy';
export type MovementType = 'all' | 'in' | 'order' | 'manual';
export type PayoutStatus = 'all' | 'pending' | 'completed' | 'failed';
export type PaymentMethod = 'all' | 'mpesa_till' | 'mpesa_paybill' | 'bank_transfer' | 'mobile_money';
export type ShipStatus = 'all' | 'pending' | 'in_transit' | 'delivered' | 'failed';

/* ─── Response Types ─── */

export interface RevenuePoint {
  label: string;
  value: number;
}

export interface SalesReportResponse {
  revenue_series: RevenuePoint[];
  total_orders: number;
  total_sales: number;
  avg_order_value: number;
  top_category: string | null;
}

export interface OrderRow {
  order_id: string;
  order_date: string;
  item_count: number;
  total_amount: number;
  shipping_type: string;
  status: string;
}

export interface OrdersReportResponse {
  total_orders: number;
  orders: OrderRow[];
}

export interface ProductRow {
  product_name: string;
  qty_sold: number;
  revenue: number;
}

export interface ProductsReportResponse {
  products: ProductRow[];
}

export interface InventoryProduct {
  product_name: string;
  quantity: number;
  price: number;
  is_flash_sale: boolean;
  last_updated: string;
}

export interface InventoryReportResponse {
  total_skus: number;
  low_stock: number;
  out_of_stock: number;
  flash_sale_items: number;
  products: InventoryProduct[];
}

export interface MovementRow {
  movement_id: string;
  product_name: string;
  movement_type: string;
  quantity_change: number;
  previous_quantity: number;
  new_quantity: number;
  reference_id: string;
  created_at: string;
}

export interface MovementsReportResponse {
  movements: MovementRow[];
}

export interface EarningsReportResponse {
  available_balance: number;
  pending_balance: number;
  period_earnings: number;
  currency: string;
  completed_orders_count: number;
}

export interface PayoutRow {
  payout_id: string;
  amount: number;
  status: string;
  method: string;
  requested_at: string;
  processed_at: string | null;
}

export interface PayoutsReportResponse {
  total_paid_out: number;
  pending: number;
  failed: number;
  payout_count: number;
  payouts: PayoutRow[];
}

export interface ReviewRow {
  product_name: string;
  rating_value: number;
  comment: string | null;
  date_created: string;
}

export interface ReviewsReportResponse {
  avg_rating: number;
  total_reviews: number;
  five_star: number;
  low_star: number;
  reviews: ReviewRow[];
}

export interface ShipmentRow {
  shipment_id: string;
  tracking_number: string;
  status: string;
  delivery_fee: number;
  last_update_time: string;
}

export interface ShipmentsReportResponse {
  total_shipments: number;
  in_transit: number;
  delivered: number;
  failed: number;
  shipments: ShipmentRow[];
}

export interface SuborderRow {
  suborder_id: string;
  order_id: string;
  subtotal: number;
  status: string;
  created_at: string;
}

export interface SubordersReportResponse {
  total_suborders: number;
  total_subtotal: number;
  pending: number;
  delivered: number;
  suborders: SuborderRow[];
}

/* ─── 1. SALES OVERVIEW ─── */

export interface SalesReportParams {
  range?: DateRange;
  status?: OrderStatus;
  granularity?: Granularity;
}

/**
 * Revenue time-series + KPIs.
 * NOTE: This calls /reports/sales/ but returns only the revenue_series
 * array to stay compatible with existing chart components.
 * Use getSalesOverview() if you need the full KPI payload.
 */
export function getRevenueSeries(params?: { range?: DateRange }): Promise<RevenuePoint[]> {
  return apiRequest<SalesReportResponse>('/reports/sales', {
    params: params as Record<string, string>,
  }).then((res) => res.revenue_series ?? []);
}

/** Full sales overview including totals, avg order value, and top category. */
export function getSalesOverview(params?: SalesReportParams): Promise<SalesReportResponse> {
  return apiRequest('/reports/sales', { params: params as Record<string, string> });
}

/* ─── 2. ORDERS ─── */

export interface OrdersReportParams {
  range?: DateRange;
  status?: OrderStatus;
  shipping_type?: ShippingType;
  sort?: OrdersSort;
  search?: string;
}

export function getOrdersReport(params?: OrdersReportParams): Promise<OrdersReportResponse> {
  return apiRequest('/reports/orders', { params: params as Record<string, string> });
}

/* ─── 3. PRODUCTS ─── */

export interface ProductsReportParams {
  range?: DateRange;
  sort?: ProductsSort;
  search?: string;
}

export function getProductsReport(params?: ProductsReportParams): Promise<ProductsReportResponse> {
  return apiRequest('/reports/products', { params: params as Record<string, string> });
}

/* ─── 4. INVENTORY (stub — backend returns 501) ─── */

export interface InventoryReportParams {
  stock_level?: StockLevel;
  sort?: 'qty_asc' | 'qty_desc' | 'updated' | 'price';
  search?: string;
  flash_sale_only?: boolean;
}

export function getInventoryReport(params?: InventoryReportParams): Promise<InventoryReportResponse> {
  return apiRequest('/reports/inventory', { params: params as Record<string, string> });
}

/* ─── 5. STOCK MOVEMENTS (stub — backend returns 501) ─── */

export interface MovementsReportParams {
  range?: DateRange;
  movement_type?: MovementType;
}

export function getMovementsReport(params?: MovementsReportParams): Promise<MovementsReportResponse> {
  return apiRequest('/reports/movements', { params: params as Record<string, string> });
}

/* ─── 6. EARNINGS (stub — backend returns 501) ─── */

export interface EarningsReportParams {
  range?: DateRange;
}

export function getEarningsReport(params?: EarningsReportParams): Promise<EarningsReportResponse> {
  return apiRequest('/reports/earnings', { params: params as Record<string, string> });
}

/* ─── 7. PAYOUTS (stub — backend returns 501) ─── */

export interface PayoutsReportParams {
  range?: DateRange;
  status?: PayoutStatus;
  payment_method?: PaymentMethod;
}

export function getPayoutsReport(params?: PayoutsReportParams): Promise<PayoutsReportResponse> {
  return apiRequest('/reports/payouts', { params: params as Record<string, string> });
}

/* ─── 8. REVIEWS (stub — backend returns 501) ─── */

export interface ReviewsReportParams {
  range?: DateRange;
  rating?: 'all' | '5' | '4' | '3';
  search?: string;
}

export function getReviewsReport(params?: ReviewsReportParams): Promise<ReviewsReportResponse> {
  return apiRequest('/reports/reviews', { params: params as Record<string, string> });
}

/* ─── 9. SHIPMENTS (stub — backend returns 501) ─── */

export interface ShipmentsReportParams {
  range?: DateRange;
  status?: ShipStatus;
  search?: string;
}

export function getShipmentsReport(params?: ShipmentsReportParams): Promise<ShipmentsReportResponse> {
  return apiRequest('/reports/shipments', { params: params as Record<string, string> });
}

/* ─── 10. SUBORDERS (stub — backend returns 501) ─── */

export interface SubordersReportParams {
  range?: DateRange;
  status?: OrderStatus;
}

export function getSubordersReport(params?: SubordersReportParams): Promise<SubordersReportResponse> {
  return apiRequest('/reports/suborders', { params: params as Record<string, string> });
}
