import { supabase } from "@/integrations/supabase/client";
import { TraceRecord, EvalStatus, DailyStats, FunctionCall } from "@/types/trace";
import { Database } from "@/integrations/supabase/types";

type ToolType = Database['public']['Enums']['tool_type'] | undefined;
type ScenarioType = Database['public']['Enums']['scenario_type'] | undefined;
type StatusType = Database['public']['Enums']['eval_status_type'] | undefined;
type DataSourceType = Database['public']['Enums']['data_source_type'] | undefined;

// Function to fetch trace records for listing with optional filters
export const fetchTraceRecords = async (
  tool?: ToolType,
  scenario?: ScenarioType,
  status?: StatusType,
  dataSource?: DataSourceType
): Promise<TraceRecord[]> => {
  // Start the query - only fetch essential fields
  let query = supabase
    .from('llm_traces')
    .select('id, status, llm_score, created_at, tool, scenario, data_source')
    .order('created_at', { ascending: true });
  
  // Apply filters if provided
  if (tool) {
    query = query.eq('tool', tool);
  }
  
  if (scenario) {
    query = query.eq('scenario', scenario);
  }
  
  if (status) {
    query = query.eq('status', status);
  }
  
  if (dataSource) {
    query = query.eq('data_source', dataSource);
  }
  
  // Execute the query
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching trace records:', error);
    throw error;
  }

  // Map the database records to our application's TraceRecord type with minimal data
  return (data || []).map(record => ({
    id: record.id,
    status: record.status,
    llmScore: record.llm_score,
    userMessage: "", // Don't load user message in the list view
    date: record.created_at,
    metadata: {
      toolName: record.tool,
      scenario: record.scenario,
      dataSource: record.data_source,
      timestamp: record.created_at
    }
  }));
};

// Function to fetch a single trace record with full details
export const fetchTraceRecordDetails = async (id: string): Promise<TraceRecord> => {
  const { data, error } = await supabase
    .from('llm_traces')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching trace record details:', error);
    throw error;
  }

  // Fetch associated function calls if any
  const { data: functionCalls, error: functionError } = await supabase
    .from('llm_function_calls')
    .select('*')
    .eq('trace_id', id);
  
  if (functionError) {
    console.error('Error fetching function calls:', functionError);
  }

  // Transform function calls to match our FunctionCall interface
  const transformedFunctionCalls: FunctionCall[] = functionCalls ? functionCalls.map(call => ({
    id: call.id,
    trace_id: call.trace_id,
    function_name: call.function_name,
    function_arguments: call.function_arguments,
    function_response: call.function_response,
    created_at: call.created_at
  })) : [];

  return {
    id: data.id,
    status: data.status,
    llmScore: data.llm_score,
    userMessage: data.user_message,
    assistantResponse: data.assistant_response,
    editableOutput: data.editable_output || data.assistant_response, // Fallback to assistant response if no editable output
    date: data.created_at,
    rejectReason: data.reject_reason || undefined,
    metadata: {
      toolName: data.tool,
      scenario: data.scenario,
      dataSource: data.data_source, // Ensure data_source is properly included
      timestamp: data.created_at,
      functionCalls: transformedFunctionCalls
    }
  };
};

// Function to update trace record status
export const updateTraceStatus = async (
  id: string,
  status: EvalStatus,
  rejectReason?: string
): Promise<void> => {
  const updates: {
    status: EvalStatus;
    reject_reason?: string | null;
  } = { status };
  
  if (status === 'Rejected' && rejectReason) {
    updates.reject_reason = rejectReason;
  } else if (status === 'Pending' || status === 'Accepted') {
    updates.reject_reason = null;
  }
  
  const { error } = await supabase
    .from('llm_traces')
    .update(updates)
    .eq('id', id);
  
  if (error) {
    console.error('Error updating trace status:', error);
    throw error;
  }
};

// Function to update trace editable output
export const updateTraceOutput = async (
  id: string,
  output: string
): Promise<void> => {
  const { error } = await supabase
    .from('llm_traces')
    .update({ editable_output: output })
    .eq('id', id);
  
  if (error) {
    console.error('Error updating trace output:', error);
    throw error;
  }
};

// Function to fetch daily statistics
export const fetchDailyStats = async (days: number = 7): Promise<DailyStats[]> => {
  try {
    const { data, error } = await supabase
      .rpc('get_daily_stats', { days_limit: days });
    
    if (error) {
      console.error('Error fetching daily stats:', error);
      throw error;
    }

    // Transform the data to match our DailyStats interface
    return (data || []).map(item => ({
      date: item.date,
      agreementRate: Number(item.agreement_rate),
      acceptanceRate: Number(item.acceptance_rate)
    }));
  } catch (error) {
    console.error('Error fetching daily stats:', error);
    return []; // Return empty array on error to prevent UI crashes
  }
};
