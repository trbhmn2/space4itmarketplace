-- ==========================================
-- Space4It — Complete Supabase Setup
-- Paste this entire file into the Supabase
-- SQL Editor and run it in one go.
-- ==========================================


-- ==========================================
-- 1. EXTENSIONS
-- ==========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ==========================================
-- 2. TABLES
-- ==========================================

CREATE TABLE IF NOT EXISTS public.users (
  id          uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email       text UNIQUE NOT NULL,
  role_storer boolean DEFAULT false,
  role_host   boolean DEFAULT false,
  verified    boolean DEFAULT false,
  name        text,
  phone       text,
  photo_url   text,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.listings (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id             uuid REFERENCES public.users(id) ON DELETE CASCADE,
  title               text NOT NULL,
  area                text,
  item_categories     jsonb,
  capacity            integer,
  rules               text,
  photos              jsonb,
  availability_start  date,
  availability_end    date,
  accepts_bikes       boolean DEFAULT false,
  accepts_bulky       boolean DEFAULT false,
  status              text DEFAULT 'active',
  updated_at          timestamptz DEFAULT now(),
  created_at          timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.booking_requests (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  storer_id       uuid REFERENCES public.users(id),
  listing_id      uuid REFERENCES public.listings(id),
  standard_boxes  integer DEFAULT 0,
  small_bulky     integer DEFAULT 0,
  large_bulky     integer DEFAULT 0,
  bikes           integer DEFAULT 0,
  drop_off_date   date,
  collection_date date,
  notes           text,
  status          text DEFAULT 'pending',
  updated_at      timestamptz DEFAULT now(),
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bookings (
  id                   uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id           uuid REFERENCES public.booking_requests(id),
  payment_status       text DEFAULT 'unpaid',
  payout_status        text DEFAULT 'pending',
  confirmed_drop_off   date,
  confirmed_collection date,
  dispute_state        text,
  created_at           timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id           uuid,
  sender_id           uuid REFERENCES public.users(id),
  booking_request_id  uuid REFERENCES public.booking_requests(id),
  content             text NOT NULL,
  moderation_flag     boolean DEFAULT false,
  created_at          timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id    uuid REFERENCES public.bookings(id),
  amount        numeric(10,2),
  platform_fee  numeric(10,2),
  refund_status text DEFAULT 'none',
  created_at    timestamptz DEFAULT now()
);


-- ==========================================
-- 3. ROW LEVEL SECURITY
-- ==========================================

-- Enable RLS on every table
ALTER TABLE public.users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments         ENABLE ROW LEVEL SECURITY;

-- ---- users ----

CREATE POLICY "users_select_public_profile"
  ON public.users FOR SELECT
  USING (true);

CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ---- listings ----

CREATE POLICY "listings_select_active"
  ON public.listings FOR SELECT
  USING (status = 'active');

CREATE POLICY "listings_insert_host"
  ON public.listings FOR INSERT
  WITH CHECK (
    auth.uid() = host_id
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role_host = true
    )
  );

CREATE POLICY "listings_update_own"
  ON public.listings FOR UPDATE
  USING (auth.uid() = host_id)
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "listings_delete_own"
  ON public.listings FOR DELETE
  USING (auth.uid() = host_id);

-- ---- booking_requests ----

CREATE POLICY "booking_requests_select"
  ON public.booking_requests FOR SELECT
  USING (
    auth.uid() = storer_id
    OR EXISTS (
      SELECT 1 FROM public.listings
      WHERE id = booking_requests.listing_id
        AND host_id = auth.uid()
    )
  );

CREATE POLICY "booking_requests_insert_storer"
  ON public.booking_requests FOR INSERT
  WITH CHECK (
    auth.uid() = storer_id
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role_storer = true
    )
  );

CREATE POLICY "booking_requests_update_own_pending"
  ON public.booking_requests FOR UPDATE
  USING (
    auth.uid() = storer_id
    AND status = 'pending'
  )
  WITH CHECK (auth.uid() = storer_id);

-- ---- bookings ----

CREATE POLICY "bookings_select_participants"
  ON public.bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.booking_requests br
      WHERE br.id = bookings.request_id
        AND (
          br.storer_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.listings l
            WHERE l.id = br.listing_id
              AND l.host_id = auth.uid()
          )
        )
    )
  );

-- Admin-only update: no user-facing policy for now.
-- Uncomment and adapt when an admin role is introduced.
-- CREATE POLICY "bookings_update_admin"
--   ON public.bookings FOR UPDATE
--   USING (false);

-- ---- messages ----

CREATE POLICY "messages_select_thread_participants"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.booking_requests br
      WHERE br.id = messages.booking_request_id
        AND (
          br.storer_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.listings l
            WHERE l.id = br.listing_id
              AND l.host_id = auth.uid()
          )
        )
    )
  );

CREATE POLICY "messages_insert_own"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- ---- payments ----

CREATE POLICY "payments_select_own"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      JOIN public.booking_requests br ON br.id = b.request_id
      WHERE b.id = payments.booking_id
        AND (
          br.storer_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.listings l
            WHERE l.id = br.listing_id
              AND l.host_id = auth.uid()
          )
        )
    )
  );


-- ==========================================
-- 4. FUNCTIONS AND TRIGGERS
-- ==========================================

-- Auto-create a public.users row when someone signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- Generic updated_at timestamp function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS listings_updated_at ON public.listings;
CREATE TRIGGER listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS booking_requests_updated_at ON public.booking_requests;
CREATE TRIGGER booking_requests_updated_at
  BEFORE UPDATE ON public.booking_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();


-- ==========================================
-- 5. SEED DATA
-- ==========================================
-- Uses a fixed test UUID as the host_id placeholder.
-- Replace with a real user id once auth users exist.

DO $$
DECLARE
  test_host_id uuid := '00000000-0000-0000-0000-000000000001';
BEGIN
  -- Ensure placeholder host exists so FK constraints pass
  INSERT INTO auth.users (id, email, raw_user_meta_data, created_at, updated_at, instance_id, aud, role)
  VALUES (
    test_host_id,
    'testhost@st-andrews.ac.uk',
    '{"name": "Test Host"}'::jsonb,
    now(), now(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.users (id, email, role_host, verified, name)
  VALUES (test_host_id, 'testhost@st-andrews.ac.uk', true, true, 'Test Host')
  ON CONFLICT (id) DO NOTHING;

  -- 1. Emma — South Street
  INSERT INTO public.listings
    (host_id, title, area, item_categories, capacity, rules, photos,
     availability_start, availability_end, accepts_bikes, accepts_bulky, status)
  VALUES (
    test_host_id,
    'Emma''s Cosy Spare Room — South Street',
    'South Street',
    '["boxes", "bags", "bulky items"]'::jsonb,
    12,
    'No liquids or perishables. Label every box.',
    '["https://placehold.co/600x400?text=Emma+South+St"]'::jsonb,
    '2025-05-15', '2025-08-20',
    false, true, 'active'
  );

  -- 2. James — North Haugh
  INSERT INTO public.listings
    (host_id, title, area, item_categories, capacity, rules, photos,
     availability_start, availability_end, accepts_bikes, accepts_bulky, status)
  VALUES (
    test_host_id,
    'James''s Garage Space — North Haugh',
    'North Haugh',
    '["boxes", "bags"]'::jsonb,
    8,
    'Standard boxes only, no oversized items.',
    '["https://placehold.co/600x400?text=James+North+Haugh"]'::jsonb,
    '2025-05-10', '2025-09-05',
    false, false, 'active'
  );

  -- 3. Sofia — Market Street
  INSERT INTO public.listings
    (host_id, title, area, item_categories, capacity, rules, photos,
     availability_start, availability_end, accepts_bikes, accepts_bulky, status)
  VALUES (
    test_host_id,
    'Sofia''s Spacious Flat — Market Street',
    'Market Street',
    '["boxes", "bags", "bulky items", "sports gear"]'::jsonb,
    20,
    'Happy to store bikes and larger items. Ground floor access.',
    '["https://placehold.co/600x400?text=Sofia+Market+St"]'::jsonb,
    '2025-05-20', '2025-08-30',
    true, true, 'active'
  );

  -- 4. Lucas — City Road
  INSERT INTO public.listings
    (host_id, title, area, item_categories, capacity, rules, photos,
     availability_start, availability_end, accepts_bikes, accepts_bulky, status)
  VALUES (
    test_host_id,
    'Lucas''s Lockable Shed — City Road',
    'City Road',
    '["boxes", "bags"]'::jsonb,
    6,
    'Dry and secure. Standard boxes preferred.',
    '["https://placehold.co/600x400?text=Lucas+City+Rd"]'::jsonb,
    '2025-05-08', '2025-09-01',
    false, false, 'active'
  );

  -- 5. Olivia — St Mary's Place
  INSERT INTO public.listings
    (host_id, title, area, item_categories, capacity, rules, photos,
     availability_start, availability_end, accepts_bikes, accepts_bulky, status)
  VALUES (
    test_host_id,
    'Olivia''s Large Attic — St Mary''s Place',
    'St Mary''s Place',
    '["boxes", "bags", "bulky items"]'::jsonb,
    15,
    'Attic access via ladder — no fragile items over 20 kg please.',
    '["https://placehold.co/600x400?text=Olivia+St+Marys"]'::jsonb,
    '2025-05-18', '2025-08-25',
    false, true, 'active'
  );

  -- 6. Noah — Howard Place
  INSERT INTO public.listings
    (host_id, title, area, item_categories, capacity, rules, photos,
     availability_start, availability_end, accepts_bikes, accepts_bulky, status)
  VALUES (
    test_host_id,
    'Noah''s Under-Stair Cupboard — Howard Place',
    'Howard Place',
    '["boxes", "bags"]'::jsonb,
    10,
    'Compact space. Small to medium boxes only.',
    '["https://placehold.co/600x400?text=Noah+Howard+Pl"]'::jsonb,
    '2025-05-12', '2025-08-28',
    false, false, 'active'
  );
END;
$$;
