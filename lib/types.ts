// ============================================================
// StockFlow 3D — Shared TypeScript Types
// ============================================================

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock_quantity: number;
  reorder_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  product?: Product;
}

export type InvoiceStatus = 'PAID' | 'CANCELLED';

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  notes: string;
  created_at: string;
  created_by: string | null;
  invoice_items?: InvoiceItem[];
}

export interface CreateInvoiceItemInput {
  product_id: string;
  quantity: number;
  product_name?: string;
  unit_price?: number; // display only — server uses DB price
  line_total?: number; // display only
}

export interface CreateInvoiceInput {
  customer_name: string;
  items: CreateInvoiceItemInput[];
  discount_pct: number;
  notes?: string;
}

export interface ProductFormInput {
  sku: string;
  name: string;
  description?: string;
  category?: string;
  price: number;
  stock_quantity: number;
  reorder_threshold: number;
}

export interface DashboardStats {
  totalProducts: number;
  totalUnits: number;
  lowStockCount: number;
  totalInvoices: number;
  totalRevenue: number;
  recentInvoices: Invoice[];
  lowStockProducts: Product[];
}

export interface ApiError {
  error: string;
  details?: string;
}

export interface ApiSuccess<T> {
  data: T;
  message?: string;
}
