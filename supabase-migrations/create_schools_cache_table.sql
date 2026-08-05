-- College Scorecard cache table
-- Stores verified government data per UNITID so we never hit the API twice for the same school
-- Run this once in Supabase SQL editor

CREATE TABLE IF NOT EXISTS public.schools_cache (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id      integer     UNIQUE NOT NULL,  -- IPEDS UNITID — permanent government ID
  name         text        NOT NULL,
  state        text,
  ownership    integer,    -- 1 = public, 2 = private nonprofit, 3 = for-profit
  admission_rate      decimal,   -- 0.0–1.0 e.g. 0.42 means 42%
  completion_rate     decimal,   -- 4yr graduation rate 0.0–1.0
  net_price_public    integer,   -- avg net price for public schools (dollars)
  net_price_private   integer,   -- avg net price for private schools (dollars)
  tuition_in_state    integer,   -- dollars
  tuition_out_of_state integer,  -- dollars
  median_earnings_10yr integer,  -- median earnings 10 years after entry (dollars)
  enrollment   integer,
  data_year    text,
  updated_at   timestamptz DEFAULT now()
);

-- GIN index for fast ILIKE name lookups
CREATE INDEX IF NOT EXISTS idx_schools_cache_name
  ON public.schools_cache
  USING gin (to_tsvector('english', name));

-- Simple btree for unit_id lookups
CREATE INDEX IF NOT EXISTS idx_schools_cache_unit_id
  ON public.schools_cache (unit_id);

-- RLS: enable row level security
ALTER TABLE public.schools_cache ENABLE ROW LEVEL SECURITY;

-- Any authenticated user (server routes) can read the cache
CREATE POLICY "authenticated_read_schools_cache"
  ON public.schools_cache
  FOR SELECT
  TO authenticated
  USING (true);

-- Server routes write to the cache on behalf of authenticated users
CREATE POLICY "authenticated_insert_schools_cache"
  ON public.schools_cache
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "authenticated_update_schools_cache"
  ON public.schools_cache
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
