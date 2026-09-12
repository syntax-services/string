export type AccountType = 'customer' | 'business';
export type ResolvedUserType = AccountType | 'admin';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  user_type: 'customer' | 'business' | 'admin';
  avatar_url: string | null;
  onboarding_completed: boolean;
  accepted_terms_version: number | null;
  coupon_balance: number;
  referral_code_used: string | null;
  campus_location?: string | null;
  verification_level?: number | null;
  idic_code?: string | null;
  idic_department?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  user_id: string;
  company_name: string;
  business_type: 'goods' | 'services' | 'both';
  description: string | null;
  business_location: string | null;
  area_name?: string | null;
  logo_url: string | null;
  banner_url?: string | null;
  verified: boolean | null;
  location_verified?: boolean | null;
  verification_tier?: string;
  views_count?: number | null;
  is_open_now?: boolean;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  business_id: string;
  price: number;
  compare_at_price?: number | null;
  image_url: string | null;
  images?: string[] | null;
  description: string | null;
  stock_quantity: number;
  category?: string | null;
  tags?: string[] | null;
  is_active?: boolean;
  business?: Business;
}

export interface Service {
  id: string;
  name: string;
  business_id: string;
  price_min?: number | null;
  price_max?: number | null;
  description: string | null;
  images?: string[] | null;
  category?: string | null;
  business?: Business;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedVariant?: string;
}

export interface Order {
  id: string;
  order_number?: string;
  customer_id: string;
  business_id: string;
  status: 'pending' | 'accepted' | 'dispatched' | 'delivered' | 'completed' | 'cancelled';
  total_amount: number;
  delivery_fee: number;
  delivery_address: string;
  delivery_code?: string; // Release PIN
  created_at: string;
  business?: Business;
  items?: {
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    image_url?: string | null;
  }[];
}

export interface Conversation {
  id: string;
  customer_id: string;
  business_id: string;
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
  business?: Business;
  customer_name?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  image_url?: string | null;
  audio_url?: string | null;
  created_at: string;
}

export interface TikTokConnection {
  id: string;
  business_id: string;
  tiktok_username: string;
  tiktok_display_name: string;
  tiktok_avatar_url: string | null;
  is_connected: boolean;
  auto_boost_enabled: boolean;
  auto_boost_frequency: 'daily' | 'weekly' | 'biweekly';
  total_promotions_posted: number;
  total_tiktok_views: number;
  total_tiktok_likes: number;
  last_promoted_at: string | null;
}
