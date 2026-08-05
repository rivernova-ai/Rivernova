-- Add international school fields to schools_cache
-- Run this in Supabase SQL editor

ALTER TABLE public.schools_cache
  ADD COLUMN IF NOT EXISTS source               text DEFAULT 'scorecard',
  ADD COLUMN IF NOT EXISTS country              text,
  ADD COLUMN IF NOT EXISTS post_grad_work_rights text,
  ADD COLUMN IF NOT EXISTS english_requirements  text;
