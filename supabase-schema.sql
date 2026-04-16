-- Rivernova MVP Database Schema
-- Run this in Supabase SQL Editor

-- User Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  academic_background JSONB DEFAULT '{}'::jsonb,
  career_goals JSONB DEFAULT '{}'::jsonb,
  budget JSONB DEFAULT '{}'::jsonb,
  location_preferences JSONB DEFAULT '{}'::jsonb,
  mode TEXT CHECK (mode IN ('domestic', 'international', 'lifelong')) DEFAULT 'international',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  privacy_settings JSONB DEFAULT '{
    "data_sharing": false,
    "marketing_emails": true,
    "analytics_tracking": true,
    "profile_visibility": "private"
  }'::jsonb,
  cookie_consent JSONB DEFAULT '{}'::jsonb,
  consent_date TIMESTAMPTZ,
  terms_accepted BOOLEAN DEFAULT FALSE,
  terms_accepted_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- School Matches
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  school_name TEXT NOT NULL,
  school_data JSONB DEFAULT '{}'::jsonb,
  success_probability NUMERIC,
  reasoning TEXT,
  cost_breakdown JSONB DEFAULT '{}'::jsonb,
  citations JSONB DEFAULT '[]'::jsonb,
  favorited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat History
CREATE TABLE IF NOT EXISTS chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  messages JSONB DEFAULT '[]'::jsonb,
  context JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Commission Ledger (Public)
CREATE TABLE IF NOT EXISTS commission_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_name TEXT UNIQUE NOT NULL,
  country TEXT,
  commission_amount NUMERIC DEFAULT 0,
  statement TEXT DEFAULT 'Rivernova has never and will never receive any commission from this institution.',
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  public BOOLEAN DEFAULT TRUE
);

-- Referrals
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  referral_code TEXT UNIQUE NOT NULL,
  referred_users UUID[] DEFAULT ARRAY[]::UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own matches" ON matches;
DROP POLICY IF EXISTS "Users can insert own matches" ON matches;
DROP POLICY IF EXISTS "Users can update own matches" ON matches;
DROP POLICY IF EXISTS "Users can view own chat history" ON chat_history;
DROP POLICY IF EXISTS "Users can insert own chat history" ON chat_history;
DROP POLICY IF EXISTS "Ledger is public" ON commission_ledger;
DROP POLICY IF EXISTS "Users can view own referrals" ON referrals;
DROP POLICY IF EXISTS "Users can insert own referrals" ON referrals;

-- RLS Policies for Profiles
CREATE POLICY "Users can view own profile" ON profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for Matches
CREATE POLICY "Users can view own matches" ON matches 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own matches" ON matches 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own matches" ON matches 
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for Chat History
CREATE POLICY "Users can view own chat history" ON chat_history 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat history" ON chat_history 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Commission Ledger (Public Read)
CREATE POLICY "Ledger is public" ON commission_ledger 
  FOR SELECT USING (public = TRUE);

-- RLS Policies for Referrals
CREATE POLICY "Users can view own referrals" ON referrals 
  FOR SELECT USING (auth.uid() = referrer_id);

CREATE POLICY "Users can insert own referrals" ON referrals 
  FOR INSERT WITH CHECK (auth.uid() = referrer_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_matches_user_id ON matches(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_commission_ledger_school_name ON commission_ledger(school_name);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- MOAT TABLES: THE TRILLION-DOLLAR DATA
-- ============================================

-- Application Outcomes (THE GOLD MINE)
CREATE TABLE IF NOT EXISTS outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  school_name TEXT NOT NULL,
  program TEXT,
  application_status TEXT CHECK (application_status IN ('applied', 'accepted', 'rejected', 'waitlisted', 'enrolled', 'graduated')),
  gpa NUMERIC,
  test_scores JSONB DEFAULT '{}'::jsonb,
  demographics JSONB DEFAULT '{}'::jsonb,
  financial_aid_received NUMERIC,
  visa_status TEXT,
  employment_outcome JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- University Intelligence (Real Data, Not Marketing)
CREATE TABLE IF NOT EXISTS university_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_name TEXT UNIQUE NOT NULL,
  country TEXT,
  real_acceptance_rate NUMERIC,
  avg_gpa_accepted NUMERIC,
  avg_test_scores JSONB DEFAULT '{}'::jsonb,
  cost_of_living JSONB DEFAULT '{}'::jsonb,
  employment_rate NUMERIC,
  avg_starting_salary NUMERIC,
  visa_success_rate NUMERIC,
  rivernova_applications INT DEFAULT 0,
  rivernova_acceptances INT DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Application Tracking
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
  school_name TEXT NOT NULL,
  program TEXT,
  status TEXT CHECK (status IN ('draft', 'in_progress', 'submitted', 'under_review', 'decision_received')),
  deadline DATE,
  personal_info JSONB DEFAULT '{}'::jsonb,
  academic_info JSONB DEFAULT '{}'::jsonb,
  essay_prompts JSONB DEFAULT '[]'::jsonb,
  documents_uploaded JSONB DEFAULT '[]'::jsonb,
  essay_drafts INT DEFAULT 0,
  ai_assistance_used BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Events (Product Analytics)
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Waitlist (Pre-Launch Growth)
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  country TEXT,
  target_year INT,
  referral_source TEXT,
  priority_score INT DEFAULT 0,
  invited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE university_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own outcomes" ON outcomes;
DROP POLICY IF EXISTS "Users can insert own outcomes" ON outcomes;
DROP POLICY IF EXISTS "Users can update own outcomes" ON outcomes;
DROP POLICY IF EXISTS "University intelligence is public" ON university_intelligence;
DROP POLICY IF EXISTS "Users can view own applications" ON applications;
DROP POLICY IF EXISTS "Users can insert own applications" ON applications;
DROP POLICY IF EXISTS "Users can update own applications" ON applications;
DROP POLICY IF EXISTS "Users can delete own applications" ON applications;
DROP POLICY IF EXISTS "Users can insert own events" ON events;

-- RLS Policies
CREATE POLICY "Users can view own outcomes" ON outcomes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own outcomes" ON outcomes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own outcomes" ON outcomes FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "University intelligence is public" ON university_intelligence FOR SELECT USING (TRUE);

CREATE POLICY "Users can view own applications" ON applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own applications" ON applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own applications" ON applications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own applications" ON applications FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events" ON events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_outcomes_user_id ON outcomes(user_id);
CREATE INDEX IF NOT EXISTS idx_outcomes_school ON outcomes(school_name);
CREATE INDEX IF NOT EXISTS idx_outcomes_status ON outcomes(application_status);
CREATE INDEX IF NOT EXISTS idx_university_intelligence_school ON university_intelligence(school_name);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);

-- Seed some commission ledger data for demo
INSERT INTO commission_ledger (school_name, country, commission_amount, statement) VALUES
  ('Harvard University', 'United States', 0, 'Rivernova has never and will never receive any commission from this institution.'),
  ('Stanford University', 'United States', 0, 'Rivernova has never and will never receive any commission from this institution.'),
  ('MIT', 'United States', 0, 'Rivernova has never and will never receive any commission from this institution.'),
  ('University of Oxford', 'United Kingdom', 0, 'Rivernova has never and will never receive any commission from this institution.'),
  ('University of Cambridge', 'United Kingdom', 0, 'Rivernova has never and will never receive any commission from this institution.'),
  ('ETH Zurich', 'Switzerland', 0, 'Rivernova has never and will never receive any commission from this institution.'),
  ('National University of Singapore', 'Singapore', 0, 'Rivernova has never and will never receive any commission from this institution.'),
  ('University of Toronto', 'Canada', 0, 'Rivernova has never and will never receive any commission from this institution.')
ON CONFLICT (school_name) DO NOTHING;

-- ============================================
-- PRIVACY & COMPLIANCE TABLES
-- ============================================

-- Audit Logs (GDPR Compliance)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Data Deletion Requests (GDPR Right to be Forgotten)
CREATE TABLE IF NOT EXISTS deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  scheduled_deletion_date TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')) DEFAULT 'pending',
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES profiles(id)
);

-- Data Export Requests (GDPR Data Portability)
CREATE TABLE IF NOT EXISTS data_export_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  export_url TEXT,
  expires_at TIMESTAMPTZ,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_export_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own audit logs" ON audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Users can view own deletion requests" ON deletion_requests;
DROP POLICY IF EXISTS "Users can insert own deletion requests" ON deletion_requests;
DROP POLICY IF EXISTS "Users can view own export requests" ON data_export_requests;
DROP POLICY IF EXISTS "Users can insert own export requests" ON data_export_requests;

-- RLS Policies
CREATE POLICY "Users can view own audit logs" ON audit_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert audit logs" ON audit_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own deletion requests" ON deletion_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own deletion requests" ON deletion_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own export requests" ON data_export_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own export requests" ON data_export_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_user_id ON deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_status ON deletion_requests(status);
CREATE INDEX IF NOT EXISTS idx_data_export_requests_user_id ON data_export_requests(user_id);
