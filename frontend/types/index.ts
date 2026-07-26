export interface User {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  role: 'Admin' | 'WarehouseManager' | 'InventoryManager' | 'StockManager' | 'PurchaseManager' | 'SalesManager' | 'WarehouseEmployee';
  assigned_warehouse_id?: string | null;
  assigned_warehouse_name?: string;
  is_active: boolean;
  created_at?: string;
}

export interface LoginAuditLog {
  id: string;
  username: string;
  role: string;
  login_time: string;
  logout_time?: string | null;
  ip_address: string;
  browser: string;
  status: 'Success' | 'Failed' | 'Locked Out';
  session_active: boolean;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  location: string;
  capacity: number;
  current_stock_qty?: number;
  capacity_usage_pct?: number;
  manager_id?: string | null;
  manager_name?: string;
  contact_number?: string;
  status: 'Active' | 'Maintenance' | 'Inactive';
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  code: string;
  description?: string;
  created_at?: string;
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  lead_time_days: number;
  defect_rate: number;
  fulfillment_rate: number;
  reliability_score: number;
  status: 'Active' | 'Under Review' | 'Inactive';
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  description?: string;
  category_id: string;
  category_name?: string;
  supplier_id: string;
  supplier_name?: string;
  unit: string;
  cost_price: number;
  selling_price: number;
  min_stock_level: number;
  reorder_point: number;
  total_stock?: number;
  is_low_stock?: boolean;
  created_at?: string;
}

export interface Stock {
  id: string;
  product_id: string;
  warehouse_id: string;
  quantity: number;
  batch_number?: string;
  expiry_date?: string | null;
  last_updated?: string;
}

export interface StockMovement {
  id: string;
  movement_type: 'IN' | 'OUT' | 'TRANSFER';
  product_id: string;
  product_name?: string;
  product_sku?: string;
  source_warehouse_id?: string | null;
  source_warehouse_name?: string;
  target_warehouse_id?: string | null;
  target_warehouse_name?: string;
  quantity: number;
  reference_doc?: string;
  note?: string;
  performed_by_id: string;
  timestamp?: string;
}

export interface POItem {
  product_id: string;
  product_name?: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string;
  supplier_name?: string;
  warehouse_id: string;
  warehouse_name?: string;
  items: POItem[];
  total_amount: number;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'RECEIVED' | 'CANCELLED';
  created_by_id: string;
  approved_by_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SaleItem {
  product_id: string;
  product_name?: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Sale {
  id: string;
  invoice_number: string;
  warehouse_id: string;
  warehouse_name?: string;
  customer_name: string;
  items: SaleItem[];
  total_amount: number;
  payment_status: 'PAID' | 'PENDING' | 'CANCELLED';
  recorded_by_id: string;
  created_at?: string;
}

export interface NotificationItem {
  id: string;
  user_id?: string | null;
  warehouse_id?: string | null;
  title: string;
  message: string;
  type: 'LOW_STOCK' | 'PO_APPROVAL' | 'REORDER_RECOMMENDATION' | 'SYSTEM';
  is_read: boolean;
  created_at?: string;
}

export interface ForecastMetrics {
  mae: number;
  mse: number;
  r2: number;
}

export interface ForecastData {
  selected_model: string;
  metrics: ForecastMetrics;
  historical: {
    days: number[];
    actual: number[];
  };
  forecast: {
    days: number[];
    predicted: number[];
  };
  models_comparison?: Record<string, ForecastMetrics>;
}

export interface SupplierEvalMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  specificity: number;
}

export interface ConfusionMatrixData {
  true_negative: number;
  false_positive: number;
  false_negative: number;
  true_positive: number;
  matrix: number[][];
}

export interface SupplierEvalData {
  selected_model: string;
  metrics: SupplierEvalMetrics;
  confusion_matrix: ConfusionMatrixData;
  classifiers_comparison?: Record<string, SupplierEvalMetrics>;
}

export interface BusinessInsightsData {
  most_sold_product: { name: string; qty: number };
  highest_revenue_product: { name: string; revenue: number };
  best_warehouse: { name: string; revenue: number };
  fast_moving_category: string;
  total_company_revenue: number;
  total_orders: number;
}
