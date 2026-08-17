-- Application Tracker table
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  school_name TEXT NOT NULL,
  school_slug TEXT NOT NULL,
  tier TEXT,
  status TEXT DEFAULT '',
  deadline TEXT,
  notes TEXT DEFAULT '',
  documents JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, school_slug)
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own applications"
  ON applications FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Auto-update updated_at on change
CREATE OR REPLACE FUNCTION update_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_applications_updated_at();
