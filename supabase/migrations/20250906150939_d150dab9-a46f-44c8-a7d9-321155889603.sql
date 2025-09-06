-- Create custom types/enums
CREATE TYPE public.tool_type AS ENUM ('ChatGPT', 'Claude', 'Gemini', 'Other');
CREATE TYPE public.scenario_type AS ENUM ('Code Generation', 'Text Generation', 'Data Analysis', 'Creative Writing', 'Other');
CREATE TYPE public.eval_status_type AS ENUM ('Pending', 'Accepted', 'Rejected');
CREATE TYPE public.data_source_type AS ENUM ('API', 'Upload', 'Manual', 'Other');

-- Create users table for role management
CREATE TABLE public.users (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Inspector' CHECK (role IN ('Inspector', 'Reviewer', 'Admin')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create llm_traces table
CREATE TABLE public.llm_traces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_message TEXT NOT NULL,
  assistant_response TEXT,
  editable_output TEXT,
  llm_score TEXT NOT NULL CHECK (llm_score IN ('Pass', 'Fail')),
  status public.eval_status_type NOT NULL DEFAULT 'Pending',
  reject_reason TEXT,
  tool public.tool_type,
  scenario public.scenario_type,
  data_source public.data_source_type,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create llm_function_calls table
CREATE TABLE public.llm_function_calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trace_id UUID NOT NULL REFERENCES public.llm_traces(id) ON DELETE CASCADE,
  function_name TEXT NOT NULL,
  function_arguments JSONB,
  function_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.llm_traces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.llm_function_calls ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" 
ON public.users 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = id);

-- RLS Policies for llm_traces table
CREATE POLICY "All authenticated users can view traces" 
ON public.llm_traces 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Reviewers and Admins can update traces" 
ON public.llm_traces 
FOR UPDATE 
USING (public.get_current_user_role() IN ('Reviewer', 'Admin'));

-- RLS Policies for llm_function_calls table
CREATE POLICY "All authenticated users can view function calls" 
ON public.llm_function_calls 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_llm_traces_updated_at
  BEFORE UPDATE ON public.llm_traces
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create RPC function for filtered daily statistics
CREATE OR REPLACE FUNCTION public.get_daily_stats_filtered(
  days_limit INTEGER DEFAULT 7,
  filter_tool public.tool_type DEFAULT NULL,
  filter_scenario public.scenario_type DEFAULT NULL,
  filter_status public.eval_status_type DEFAULT NULL,
  filter_data_source public.data_source_type DEFAULT NULL
)
RETURNS TABLE (
  date DATE,
  agreement_rate NUMERIC,
  acceptance_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(created_at) as date,
    CASE 
      WHEN COUNT(*) = 0 THEN 0
      ELSE ROUND(
        (COUNT(*) FILTER (WHERE (llm_score = 'Pass' AND status = 'Accepted') OR (llm_score = 'Fail' AND status = 'Rejected')))::NUMERIC 
        / COUNT(*)::NUMERIC * 100, 2
      )
    END as agreement_rate,
    CASE 
      WHEN COUNT(*) = 0 THEN 0
      ELSE ROUND(
        (COUNT(*) FILTER (WHERE status = 'Accepted'))::NUMERIC 
        / COUNT(*)::NUMERIC * 100, 2
      )
    END as acceptance_rate
  FROM public.llm_traces
  WHERE 
    created_at >= CURRENT_DATE - INTERVAL '1 day' * days_limit
    AND (filter_tool IS NULL OR tool = filter_tool)
    AND (filter_scenario IS NULL OR scenario = filter_scenario)
    AND (filter_status IS NULL OR status = filter_status)
    AND (filter_data_source IS NULL OR data_source = filter_data_source)
  GROUP BY DATE(created_at)
  ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create indexes for better performance
CREATE INDEX idx_llm_traces_created_at ON public.llm_traces(created_at);
CREATE INDEX idx_llm_traces_status ON public.llm_traces(status);
CREATE INDEX idx_llm_traces_tool ON public.llm_traces(tool);
CREATE INDEX idx_llm_traces_scenario ON public.llm_traces(scenario);
CREATE INDEX idx_llm_function_calls_trace_id ON public.llm_function_calls(trace_id);