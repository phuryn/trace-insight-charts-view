
export type EvalStatus = 'Pending' | 'Accepted' | 'Rejected';
export type LLMScore = 'Pass' | 'Fail';

export interface TraceRecord {
  id: string;
  status: EvalStatus;
  llmScore: LLMScore;
  userMessage: string;
  assistantResponse: string;
  editableOutput: string;
  date: string; // ISO date string
}

export interface DailyStats {
  date: string;
  agreementRate: number;
  acceptanceRate: number;
}
