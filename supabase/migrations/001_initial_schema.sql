-- 001_initial_schema.sql
-- Space4It Marketplace — initial database schema

-- ───────────────────────────────────────────────
-- TABLES
-- ───────────────────────────────────────────────

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  role_storer   BOOLEAN DEFAULT false,
  role_host     BOOLEAN DEFAULT false,
  verified      BOOLEAN DEFAULT false,
  name          TEXT NOT NULL,
  phone         TEXT,
  photo_url     TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE listings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id             UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title               TEXT NOT NULL,
  area                TEXT NOT NULL,
  item_categories     TEXT[] DEFAULT '{}',
  capacity            INTEGER NOT NULL DEFAULT 0,
  rules               TEXT,
  photos              TEXT[] DEFAULT '{}',
  availability_start  DATE NOT NULL,
  availability_end    DATE NOT NULL,
  accepts_bikes       BOOLEAN DEFAULT false,
  accepts_bulky       BOOLEAN DEFAULT true,
  status              TEXT DEFAULT 'active'
                        CHECK (status IN ('active', 'paused', 'archived')),
  created_at          TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE booking_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storer_id       UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  listing_id      UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  standard_boxes  INTEGER DEFAULT 0,
  small_bulky     INTEGER DEFAULT 0,
  large_bulky     INTEGER DEFAULT 0,
  bikes           INTEGER DEFAULT 0,
  drop_off_date   DATE NOT NULL,
  collection_date DATE NOT NULL,
  notes           TEXT,
  status          TEXT DEFAULT 'pending'
                    CHECK (status IN (
                      'pending', 'accepted', 'declined',
                      'confirmed', 'active', 'collection_due', 'completed'
                    )),
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE bookings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id            UUID REFERENCES booking_requests(id) ON DELETE CASCADE NOT NULL,
  payment_status        TEXT DEFAULT 'pending'
                          CHECK (payment_status IN ('pending', 'deposit_paid', 'fully_paid', 'refunded')),
  payout_status         TEXT DEFAULT 'pending'
                          CHECK (payout_status IN ('pending', 'paid')),
  confirmed_drop_off    TIMESTAMPTZ,
  confirmed_collection  TIMESTAMPTZ,
  dispute_state         TEXT DEFAULT 'none'
                          CHECK (dispute_state IN ('none', 'open', 'resolved')),
  created_at            TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE messages (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id           UUID NOT NULL,
  sender_id           UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  booking_request_id  UUID REFERENCES booking_requests(id) ON DELETE CASCADE NOT NULL,
  content             TEXT NOT NULL,
  created_at          TIMESTAMPTZ DEFAULT now(),
  moderation_flag     BOOLEAN DEFAULT false
);

CREATE TABLE payments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id    UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  amount        NUMERIC(10,2) NOT NULL,
  platform_fee  NUMERIC(10,2) DEFAULT 0,
  refund_status TEXT DEFAULT 'none'
                  CHECK (refund_status IN ('none', 'partial', 'full')),
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ───────────────────────────────────────────────
-- INDEXES
-- ───────────────────────────────────────────────

CREATE INDEX idx_listings_host_id             ON listings(host_id);
CREATE INDEX idx_listings_status              ON listings(status);
CREATE INDEX idx_booking_requests_storer_id   ON booking_requests(storer_id);
CREATE INDEX idx_booking_requests_listing_id  ON booking_requests(listing_id);
CREATE INDEX idx_bookings_request_id          ON bookings(request_id);
CREATE INDEX idx_messages_booking_request_id  ON messages(booking_request_id);
CREATE INDEX idx_messages_thread_id           ON messages(thread_id);
CREATE INDEX idx_payments_booking_id          ON payments(booking_id);
