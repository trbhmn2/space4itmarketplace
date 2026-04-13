export interface User {
  id: string;
  email: string;
  role_storer: boolean;
  role_host: boolean;
  verified: boolean;
  name: string;
  phone: string | null;
  photo_url: string | null;
  created_at: string;
}

export interface Listing {
  id: string;
  host_id: string;
  title: string;
  area: string;
  item_categories: string[];
  capacity: number;
  rules: string | null;
  photos: string[];
  availability_start: string;
  availability_end: string;
  accepts_bikes: boolean;
  accepts_bulky: boolean;
  status: "active" | "paused" | "archived";
  created_at: string;
}

export interface BookingRequest {
  id: string;
  storer_id: string;
  listing_id: string;
  thread_id: string;
  standard_boxes: number;
  small_bulky: number;
  large_bulky: number;
  bikes: number;
  drop_off_date: string;
  collection_date: string;
  notes: string | null;
  status:
    | "pending"
    | "accepted"
    | "declined"
    | "confirmed"
    | "active"
    | "collection_due"
    | "completed"
    | "cancelled";
  created_at: string;
}

export interface Booking {
  id: string;
  request_id: string;
  payment_status: "pending" | "reserved" | "deposit_paid" | "fully_paid" | "refunded";
  payout_status: "pending" | "paid";
  confirmed_drop_off: string | null;
  confirmed_collection: string | null;
  dispute_state: "none" | "open" | "resolved";
  created_at: string;
}

export interface Message {
  id: string;
  thread_id: string;
  sender_id: string;
  booking_request_id: string;
  content: string;
  created_at: string;
  moderation_flag: boolean;
}

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  platform_fee: number;
  refund_status: "none" | "partial" | "full";
  created_at: string;
}
