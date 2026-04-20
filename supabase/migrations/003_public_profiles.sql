-- Allow any authenticated user to read basic profile info of other users.
-- This is needed for the browse page and listing detail page to show
-- host names, photos, and verified badges via FK joins.

CREATE POLICY "users_select_public_profile"
  ON public.users FOR SELECT
  USING (true);

-- This replaces the restrictive "users_select_own" policy.
-- Drop the old one first to avoid conflicts.
-- Note: run this in the Supabase SQL editor.
-- DROP POLICY IF EXISTS "users_select_own" ON public.users;
