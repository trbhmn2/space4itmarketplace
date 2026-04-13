-- Migration: booking flow support
-- Adds thread_id to booking_requests and expands RLS for host actions

-- 1. Add thread_id column to booking_requests
ALTER TABLE public.booking_requests
  ADD COLUMN IF NOT EXISTS thread_id uuid DEFAULT gen_random_uuid();

-- 2. Allow hosts to update booking_requests they received
CREATE POLICY "booking_requests_update_host"
  ON public.booking_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE id = booking_requests.listing_id
        AND host_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE id = booking_requests.listing_id
        AND host_id = auth.uid()
    )
  );

-- 3. Allow storer to update non-pending requests (for confirm / cancel)
DROP POLICY IF EXISTS "booking_requests_update_own_pending" ON public.booking_requests;
CREATE POLICY "booking_requests_update_own"
  ON public.booking_requests FOR UPDATE
  USING (auth.uid() = storer_id)
  WITH CHECK (auth.uid() = storer_id);

-- 4. Allow hosts to insert bookings for requests on their listings
CREATE POLICY "bookings_insert_host"
  ON public.bookings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.booking_requests br
      JOIN public.listings l ON l.id = br.listing_id
      WHERE br.id = request_id
        AND l.host_id = auth.uid()
    )
  );

-- 5. Allow storers to update bookings linked to their requests (for confirmation)
CREATE POLICY "bookings_update_storer"
  ON public.bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.booking_requests br
      WHERE br.id = bookings.request_id
        AND br.storer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.booking_requests br
      WHERE br.id = bookings.request_id
        AND br.storer_id = auth.uid()
    )
  );
