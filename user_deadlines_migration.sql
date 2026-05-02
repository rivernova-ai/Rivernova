-- Migration to add user_deadlines table for Application Deadline Tracker

CREATE TABLE IF NOT EXISTS user_deadlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  school_name TEXT NOT NULL,
  application_type TEXT CHECK (application_type IN ('Early Decision', 'Early Action', 'Regular Decision', 'Rolling')),
  deadline_date DATE,
  status TEXT CHECK (status IN ('Not Started', 'In Progress', 'Submitted', 'Accepted', 'Rejected')) DEFAULT 'Not Started',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, school_name)
);

-- Enable RLS
ALTER TABLE user_deadlines ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own deadlines" ON user_deadlines;
DROP POLICY IF EXISTS "Users can insert own deadlines" ON user_deadlines;
DROP POLICY IF EXISTS "Users can update own deadlines" ON user_deadlines;
DROP POLICY IF EXISTS "Users can delete own deadlines" ON user_deadlines;

-- RLS Policies
CREATE POLICY "Users can view own deadlines" ON user_deadlines FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own deadlines" ON user_deadlines FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own deadlines" ON user_deadlines FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own deadlines" ON user_deadlines FOR DELETE USING (auth.uid() = user_id);

-- Create Index
CREATE INDEX IF NOT EXISTS idx_user_deadlines_user_id ON user_deadlines(user_id);
