-- Essay Strategies Table
-- Stores user essay positioning data and AI-generated strategies

CREATE TABLE IF NOT EXISTS essay_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  strategy TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_essay_strategies_user_id ON essay_strategies(user_id);

-- RLS Policies
ALTER TABLE essay_strategies ENABLE ROW LEVEL SECURITY;

-- Users can only read their own essay strategies
CREATE POLICY "Users can view own essay strategies"
  ON essay_strategies
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own essay strategies
CREATE POLICY "Users can insert own essay strategies"
  ON essay_strategies
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own essay strategies
CREATE POLICY "Users can update own essay strategies"
  ON essay_strategies
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own essay strategies
CREATE POLICY "Users can delete own essay strategies"
  ON essay_strategies
  FOR DELETE
  USING (auth.uid() = user_id);
