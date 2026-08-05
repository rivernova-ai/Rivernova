-- Prevent authenticated users from forging their own rate-limit timestamps.
--
-- Without this, a user could run:
--   supabase.from('profiles').update({ last_search_at: '1970-01-01' })
-- from their browser, bypassing all cooldowns.
--
-- This trigger fires BEFORE every profiles UPDATE and rejects any attempt
-- to set a rate-limit column to a value more than 5 seconds in the past.
-- The 5-second window allows for normal clock skew between servers.
--
-- Run this in the Supabase SQL editor AFTER 20260701_rate_limit_columns.sql.

CREATE OR REPLACE FUNCTION prevent_rate_limit_forgery()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  rate_limit_cols TEXT[] := ARRAY[
    'last_search_at',
    'last_chat_at',
    'last_roi_at',
    'last_essay_at',
    'last_compare_at'
  ];
  col TEXT;
  new_val TIMESTAMPTZ;
BEGIN
  FOREACH col IN ARRAY rate_limit_cols LOOP
    EXECUTE format('SELECT ($1).%I', col) INTO new_val USING NEW;
    IF new_val IS NOT NULL AND new_val < NOW() - INTERVAL '5 seconds' THEN
      RAISE EXCEPTION
        'profiles.% cannot be set to a past timestamp (attempted: %, current: %)',
        col, new_val, NOW();
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$;

-- Drop first so re-running the migration is idempotent.
DROP TRIGGER IF EXISTS prevent_rate_limit_forgery ON profiles;

CREATE TRIGGER prevent_rate_limit_forgery
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_rate_limit_forgery();
