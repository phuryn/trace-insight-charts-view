
export type EvalStatus = 'Pending' | 'Accepted' | 'Rejected';
export type LLMScore = 'Pass' | 'Fail';

export interface FunctionCall {
  id: string;
  trace_id: string;
  function_name: string;
  function_arguments: Record<string, any>;
  function_response: Record<string, any> | null;
  created_at: string;
}

export interface TraceRecord {
  id: string;
  status: EvalStatus;
  llmScore: LLMScore;
  userMessage: string;
  assistantResponse?: string;
  editableOutput?: string;
  date: string; // ISO date string
  rejectReason?: string;
  metadata?: {
    toolName?: string;
    scenario?: string;
    timestamp?: string;
    functionCalls?: FunctionCall[];
  };
}

export interface DailyStats {
  date: string;
  agreementRate: number;
  acceptanceRate: number;
}
