
-- Create roi_reports table
CREATE TABLE IF NOT EXISTS public.roi_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    school_name TEXT NOT NULL,
    total_cost_4yr NUMERIC,
    roi_score NUMERIC,
    breakeven_years NUMERIC,
    ai_recommendation TEXT,
    major TEXT,
    tuition_per_year NUMERIC,
    living_costs_per_year NUMERIC,
    year1_salary NUMERIC,
    year3_salary NUMERIC,
    year5_salary NUMERIC,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(user_id, school_name)
);

-- Enable RLS
ALTER TABLE public.roi_reports ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own ROI reports"
ON public.roi_reports FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ROI reports"
ON public.roi_reports FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ROI reports"
ON public.roi_reports FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);
