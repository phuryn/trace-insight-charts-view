
-- Initial schema migration for LLM Traces application
-- This migration creates all tables, enums, functions, and RLS policies

-- Create custom types/enums
CREATE TYPE public.data_source_type AS ENUM ('Human', 'Synthetic', 'All');
CREATE TYPE public.eval_status_type AS ENUM ('Pending', 'Accepted', 'Rejected');
CREATE TYPE public.llm_score_type AS ENUM ('Pass', 'Fail');
CREATE TYPE public.scenario_type AS ENUM (
    'Multiple-Listings',
    'Offer-Submission', 
    'Property-Analysis',
    'Client-Communication',
    'Market-Research',
    'Closing-Process'
);
CREATE TYPE public.tool_type AS ENUM (
    'Listing-Finder',
    'Email-Draft',
    'Market-Analysis', 
    'Offer-Generator',
    'Valuation-Tool',
    'Appointment-Scheduler'
);
CREATE TYPE public.user_role AS ENUM ('Inspector', 'Reviewer', 'Admin');

-- Create users table
CREATE TABLE public.users (
    id UUID PRIMARY KEY,
    role public.user_role NOT NULL DEFAULT 'Inspector'::public.user_role,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    email TEXT NOT NULL
);

-- Create llm_traces table
CREATE TABLE public.llm_traces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    llm_score public.llm_score_type NOT NULL,
    status public.eval_status_type NOT NULL DEFAULT 'Pending'::public.eval_status_type,
    tool public.tool_type NOT NULL,
    scenario public.scenario_type NOT NULL,
    data_source public.data_source_type NOT NULL,
    user_message TEXT NOT NULL,
    assistant_response TEXT NOT NULL,
    editable_output TEXT NOT NULL,
    reject_reason TEXT
);

-- Create llm_function_calls table
CREATE TABLE public.llm_function_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trace_id UUID NOT NULL,
    function_arguments JSONB NOT NULL,
    function_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    function_name TEXT NOT NULL,
    CONSTRAINT llm_function_calls_trace_id_fkey 
        FOREIGN KEY (trace_id) REFERENCES public.llm_traces(id)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.llm_traces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.llm_function_calls ENABLE ROW LEVEL SECURITY;

-- Create database functions

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS public.user_role
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT role FROM public.users WHERE id = user_id
$$;

-- Function to get daily stats
CREATE OR REPLACE FUNCTION public.get_daily_stats(days_limit INTEGER DEFAULT 7)
RETURNS TABLE(date TEXT, agreement_rate NUMERIC, acceptance_rate NUMERIC)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM get_daily_stats_filtered(days_limit);
END;
$$;

-- Function to get filtered daily stats
CREATE OR REPLACE FUNCTION public.get_daily_stats_filtered(
    days_limit INTEGER DEFAULT 7, 
    filter_tool TEXT DEFAULT NULL, 
    filter_scenario TEXT DEFAULT NULL, 
    filter_status TEXT DEFAULT NULL, 
    filter_data_source TEXT DEFAULT NULL
)
RETURNS TABLE(date TEXT, agreement_rate NUMERIC, acceptance_rate NUMERIC)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH filtered_traces AS (
    SELECT *
    FROM llm_traces
    WHERE created_at >= CURRENT_DATE - (days_limit || ' days')::INTERVAL
    -- Apply filters only if they are not NULL
    AND (filter_tool IS NULL OR tool = filter_tool::tool_type)
    AND (filter_scenario IS NULL OR scenario = filter_scenario::scenario_type)
    AND (filter_status IS NULL OR status = filter_status::eval_status_type)
    AND (filter_data_source IS NULL OR data_source = filter_data_source::data_source_type)
  ),
  daily_counts AS (
    SELECT
      to_char(created_at, 'YYYY-MM-DD') AS date_str,
      -- Only count evaluated records (not Pending)
      COUNT(*) FILTER (WHERE status != 'Pending') AS evaluated,
      COUNT(*) FILTER (WHERE status = 'Accepted') AS accepted,
      COUNT(*) FILTER (WHERE status = 'Rejected') AS rejected,
      -- For agreement rate: (accepted with pass OR rejected with fail) / total evaluated
      COUNT(*) FILTER (WHERE (status = 'Accepted' AND llm_score = 'Pass') OR 
                             (status = 'Rejected' AND llm_score = 'Fail')) AS agreed,
      -- Total records with a non-pending status AND a valid LLM score
      COUNT(*) FILTER (WHERE status != 'Pending' AND (llm_score = 'Pass' OR llm_score = 'Fail')) AS scored
    FROM filtered_traces
    GROUP BY to_char(created_at, 'YYYY-MM-DD')
    ORDER BY date_str
  )
  SELECT
    date_str AS date,
    -- Agreement rate: only count records where human and LLM agreed
    CASE WHEN scored > 0 THEN (agreed::NUMERIC / scored) * 100 ELSE 0 END AS agreement_rate,
    -- Acceptance rate: accepted / (accepted + rejected) - exclude pending
    CASE WHEN (accepted + rejected) > 0 THEN (accepted::NUMERIC / (accepted + rejected)) * 100 ELSE 0 END AS acceptance_rate
  FROM daily_counts;
END;
$$;

-- Add indexes for better performance
CREATE INDEX idx_llm_traces_created_at ON public.llm_traces(created_at);
CREATE INDEX idx_llm_traces_status ON public.llm_traces(status);
CREATE INDEX idx_llm_traces_tool ON public.llm_traces(tool);
CREATE INDEX idx_llm_traces_scenario ON public.llm_traces(scenario);
CREATE INDEX idx_llm_traces_data_source ON public.llm_traces(data_source);
CREATE INDEX idx_llm_function_calls_trace_id ON public.llm_function_calls(trace_id);

-- Grant necessary permissions (adjust as needed for your use case)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Note: RLS policies are not included in this migration as they depend on your authentication setup
-- You may need to add RLS policies based on your specific security requirements
-- Example RLS policies (uncomment and modify as needed):

-- Example: Allow authenticated users to read all traces
-- CREATE POLICY "Allow authenticated users to read traces" 
--   ON public.llm_traces FOR SELECT 
--   TO authenticated 
--   USING (true);

-- Example: Allow specific roles to modify traces
-- CREATE POLICY "Allow reviewers to update traces" 
--   ON public.llm_traces FOR UPDATE 
--   TO authenticated 
--   USING (public.get_user_role(auth.uid()) IN ('Reviewer', 'Admin'));
