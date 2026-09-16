export type Role = 'super_admin' | 'admin' | 'manager' | 'staff' | 'customer';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  avatar?: string;
  email_verified_at?: string | null;
  created_at?: string;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  website?: string;
  is_featured?: boolean;
  products_count?: number;
}

export interface Category {
  id: number;
  parent_id?: number | null;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  display_order?: number;
  children?: Category[];
  products_count?: number;
}

export interface SpecificationItem {
  name: string;
  value: string;
  group_name?: string;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  sku: string;
  name: string;
  color?: string;
  color_hex?: string;
  storage?: string;
  ram?: string;
  price: number;
  sale_price?: number | null;
  stock: number;
  barcode?: string;
  weight?: string;
  is_active?: boolean;
}

export interface ProductImage {
  id: number;
  product_id: number;
  variant_id?: number | null;
  image_path: string;
  is_primary: boolean;
  display_order?: number;
}

export interface Product {
  id: number;
  brand_id: number;
  category_id: number;
  name: string;
  slug: string;
  sku: string;
  short_description?: string;
  description?: string;
  base_price: number;
  sale_price?: number | null;
  has_variants: boolean;
  is_featured: boolean;
  is_bestseller: boolean;
  is_active: boolean;
  warranty_info?: string;
  stock?: number;
  rating_cache?: number;
  reviews_count?: number;
  brand?: Brand;
  category?: Category;
  variants?: ProductVariant[];
  images?: ProductImage[];
  specifications?: Record<string, string> | SpecificationItem[] | any;
  reviews?: Review[];
  created_at?: string;
}

export interface CartItem {
  id: number;
  product_id: number;
  variant_id?: number | null;
  quantity: number;
  unit_price: number;
  product: Product;
  variant?: ProductVariant | null;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount_amount: number;
  shipping_fee: number;
  tax_amount: number;
  total_amount: number;
  coupon?: {
    code: string;
    discount_amount: number;
    type: 'fixed' | 'percentage';
  } | null;
}

export interface WishlistItem {
  id: number;
  product_id: number;
  product: Product;
  created_at: string;
}

export interface Address {
  id: number;
  user_id: number;
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string;
  village?: string;
  commune?: string;
  district?: string;
  province?: string;
  postal_code?: string;
  country: string;
  delivery_notes?: string;
  is_default: boolean;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type PaymentMethod = 'cod' | 'bank_transfer' | 'stripe';

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  variant_id?: number | null;
  product_name: string;
  variant_name?: string | null;
  sku: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
  product?: Product;
}

export interface OrderStatusHistory {
  id: number;
  order_id: number;
  status: OrderStatus;
  notes?: string;
  created_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  shipping_method: string;
  subtotal: number;
  discount_amount: number;
  coupon_code?: string;
  shipping_fee: number;
  tax_amount: number;
  total_amount: number;
  shipping_address_snapshot: Address;
  customer_notes?: string;
  admin_notes?: string;
  items: OrderItem[];
  status_histories?: OrderStatusHistory[];
  created_at: string;
}

export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  title: string;
  comment: string;
  is_verified_purchase: boolean;
  status: 'pending' | 'approved' | 'rejected';
  user?: {
    id: number;
    name: string;
    avatar?: string;
  };
  images?: string[];
  created_at: string;
}

export interface Coupon {
  id: number;
  code: string;
  type: 'fixed' | 'percentage';
  value: number;
  min_spend?: number;
  max_discount?: number;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
}

export interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  image_url: string;
  link_url?: string;
  button_text?: string;
  display_order?: number;
  is_active: boolean;
}

export interface InventoryTransaction {
  id: number;
  product_id: number;
  variant_id?: number | null;
  type: 'purchase' | 'sale' | 'return' | 'adjustment' | 'damage' | 'cancellation';
  quantity_change: number;
  balance_after: number;
  reference_type?: string;
  reference_id?: number;
  notes?: string;
  product_name?: string;
  variant_name?: string;
  created_at: string;
}
