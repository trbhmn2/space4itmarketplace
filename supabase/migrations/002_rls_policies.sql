-- 002_rls_policies.sql
-- Row Level Security policies for all tables

-- ───────────────────────────────────────────────
-- Enable RLS
-- ───────────────────────────────────────────────

ALTER TABLE users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings         ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings         ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages         ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments         ENABLE ROW LEVEL SECURITY;

-- ───────────────────────────────────────────────
-- USERS
-- ───────────────────────────────────────────────

CREATE POLICY "users_select_own"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_insert_signup"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ───────────────────────────────────────────────
-- LISTINGS
-- ───────────────────────────────────────────────

CREATE POLICY "listings_select_active"
  ON listings FOR SELECT
  USING (status = 'active');

CREATE POLICY "listings_select_own"
  ON listings FOR SELECT
  USING (auth.uid() = host_id);

CREATE POLICY "listings_insert_host"
  ON listings FOR INSERT
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "listings_update_host"
  ON listings FOR UPDATE
  USING (auth.uid() = host_id)
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "listings_delete_host"
  ON listings FOR DELETE
  USING (auth.uid() = host_id);

-- ───────────────────────────────────────────────
-- BOOKING REQUESTS
-- ───────────────────────────────────────────────

CREATE POLICY "booking_requests_insert_storer"
  ON booking_requests FOR INSERT
  WITH CHECK (auth.uid() = storer_id);

CREATE POLICY "booking_requests_select_storer"
  ON booking_requests FOR SELECT
  USING (auth.uid() = storer_id);

CREATE POLICY "booking_requests_select_host"
  ON booking_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = booking_requests.listing_id
        AND listings.host_id = auth.uid()
    )
  );

CREATE POLICY "booking_requests_update_host"
  ON booking_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = booking_requests.listing_id
        AND listings.host_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = booking_requests.listing_id
        AND listings.host_id = auth.uid()
    )
  );

-- ───────────────────────────────────────────────
-- BOOKINGS
-- ───────────────────────────────────────────────

CREATE POLICY "bookings_select_storer"
  ON bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM booking_requests
      WHERE booking_requests.id = bookings.request_id
        AND booking_requests.storer_id = auth.uid()
    )
  );

CREATE POLICY "bookings_select_host"
  ON bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM booking_requests
        JOIN listings ON listings.id = booking_requests.listing_id
      WHERE booking_requests.id = bookings.request_id
        AND listings.host_id = auth.uid()
    )
  );

CREATE POLICY "bookings_update_host"
  ON bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM booking_requests
        JOIN listings ON listings.id = booking_requests.listing_id
      WHERE booking_requests.id = bookings.request_id
        AND listings.host_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM booking_requests
        JOIN listings ON listings.id = booking_requests.listing_id
      WHERE booking_requests.id = bookings.request_id
        AND listings.host_id = auth.uid()
    )
  );

-- ───────────────────────────────────────────────
-- MESSAGES
-- ───────────────────────────────────────────────

CREATE POLICY "messages_select_sender"
  ON messages FOR SELECT
  USING (auth.uid() = sender_id);

CREATE POLICY "messages_select_receiver"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM booking_requests
      WHERE booking_requests.id = messages.booking_request_id
        AND (
          booking_requests.storer_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM listings
            WHERE listings.id = booking_requests.listing_id
              AND listings.host_id = auth.uid()
          )
        )
    )
  );

CREATE POLICY "messages_insert_authenticated"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM booking_requests
      WHERE booking_requests.id = messages.booking_request_id
        AND (
          booking_requests.storer_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM listings
            WHERE listings.id = booking_requests.listing_id
              AND listings.host_id = auth.uid()
          )
        )
    )
  );

-- ───────────────────────────────────────────────
-- PAYMENTS
-- ───────────────────────────────────────────────

CREATE POLICY "payments_select_storer"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings
        JOIN booking_requests ON booking_requests.id = bookings.request_id
      WHERE bookings.id = payments.booking_id
        AND booking_requests.storer_id = auth.uid()
    )
  );

CREATE POLICY "payments_select_host"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings
        JOIN booking_requests ON booking_requests.id = bookings.request_id
        JOIN listings ON listings.id = booking_requests.listing_id
      WHERE bookings.id = payments.booking_id
        AND listings.host_id = auth.uid()
    )
  );
