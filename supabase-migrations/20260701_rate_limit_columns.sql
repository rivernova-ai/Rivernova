-- Rate-limiting timestamps on profiles
-- Run this in the Supabase SQL editor before deploying F-03.
-- Each column records when the user last called that AI endpoint.
-- The application checks the gap and rejects requests within the cooldown window.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS last_search_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_chat_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_roi_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_essay_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_compare_at TIMESTAMPTZ;