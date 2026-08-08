-- Add local currency fields to schools_cache so international tuition
-- is stored in the original currency (AUD, GBP, CAD, etc.) alongside
-- the USD conversion. This lets the UI display "AU$42,500 (~$28K USD)"
-- instead of a raw USD number with no currency label.
--
-- Run this in the Supabase SQL editor.

ALTER TABLE public.schools_cache
  ADD COLUMN IF NOT EXISTS tuition_local_amount  numeric,
  ADD COLUMN IF NOT EXISTS tuition_local_currency text;
