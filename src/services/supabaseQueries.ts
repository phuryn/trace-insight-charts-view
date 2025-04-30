
import { supabase } from "@/integrations/supabase/client";
import { TraceRecord, EvalStatus, DailyStats, FunctionCall } from "@/types/trace";
import { Database } from "@/integrations/supabase/types";

// Function to fetch trace records for listing
export const fetchTraceRecords = async (): Promise<TraceRecord[]> => {
  const { data, error } = await supabase
    .from('llm_traces')
    .select('id, user_message, status, llm_score, created_at, tool, scenario, data_source')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching trace records:', error);
    throw error;
  }

  // Map the database records to our application's TraceRecord type
  return (data || []).map(record => ({
    id: record.id,
    status: record.status,
    llmScore: record.llm_score,
    userMessage: record.user_message,
    assistantResponse: "", // Will be loaded on demand when viewing details
    editableOutput: "", // Will be loaded on demand when viewing details
    date: record.created_at,
    metadata: {
      toolName: record.tool,
      scenario: record.scenario,
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
    function_arguments: call.function_arguments, // Now compatible with 'any' type
    function_response: call.function_response, // Now compatible with 'any' type
    created_at: call.created_at
  })) : [];

  return {
    id: data.id,
    status: data.status,
    llmScore: data.llm_score,
    userMessage: data.user_message,
    assistantResponse: data.assistant_response,
    editableOutput: data.editable_output,
    date: data.created_at,
    rejectReason: data.reject_reason || undefined,
    metadata: {
      toolName: data.tool,
      scenario: data.scenario,
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
  const { data, error } = await supabase
    .rpc('get_daily_stats', { days_limit: days });
  
  if (error) {
    console.error('Error fetching daily stats:', error);
    throw error;
  }

  return (data || []).map(item => ({
    date: item.date,
    agreementRate: Number(item.agreement_rate),
    acceptanceRate: Number(item.acceptance_rate)
  }));
};
