
import { TraceRecord, EvalStatus, LLMScore } from "@/types/trace";

// Mock trace records data
export const getTraceRecords = (): TraceRecord[] => {
  return [
    {
      id: "trace-001",
      status: "Pending",
      llmScore: "Pass",
      userMessage: "Can you help me write a function to calculate the Fibonacci sequence?",
      assistantResponse: "Sure, here's a JavaScript function to calculate the Fibonacci sequence:\n\n```javascript\nfunction fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n-1) + fibonacci(n-2);\n}\n```\n\nThis is a recursive implementation. For large values of n, you might want to use a more efficient approach like dynamic programming.",
      editableOutput: "Sure, here's a JavaScript function to calculate the Fibonacci sequence:\n\n```javascript\nfunction fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n-1) + fibonacci(n-2);\n}\n```\n\nThis is a recursive implementation. For large values of n, you might want to use a more efficient approach like dynamic programming.",
      date: "2025-04-23T14:30:00Z",
    },
    {
      id: "trace-002",
      status: "Accepted",
      llmScore: "Pass",
      userMessage: "What's the capital of France?",
      assistantResponse: "The capital of France is Paris.",
      editableOutput: "The capital of France is Paris.",
      date: "2025-04-24T09:15:00Z",
    },
    {
      id: "trace-003",
      status: "Rejected",
      llmScore: "Fail",
      userMessage: "How do I make chocolate chip cookies?",
      assistantResponse: "To make chocolate chip cookies, you need:\n- 1 cup butter\n- 1 cup sugar\n- 1 cup brown sugar\n- 2 eggs\n- 2 tsp vanilla\n- 3 cups flour\n- 1 tsp baking soda\n- 1/2 tsp salt\n- 2 cups chocolate chips\n\nMix ingredients, bake at 350°F for 8-10 minutes.",
      editableOutput: "This recipe doesn't include proper instructions for mixing and baking the cookies. It's missing important details about the order of ingredients and baking technique.",
      date: "2025-04-25T16:45:00Z",
    },
    {
      id: "trace-004",
      status: "Pending",
      llmScore: "Fail",
      userMessage: "Explain quantum computing in simple terms.",
      assistantResponse: "Quantum computing uses quantum bits or 'qubits' that can exist in multiple states simultaneously, unlike classical bits that are either 0 or 1. This allows quantum computers to process a vast number of possibilities at once, making them potentially much faster for certain types of problems.",
      editableOutput: "Quantum computing uses quantum bits or 'qubits' that can exist in multiple states simultaneously, unlike classical bits that are either 0 or 1. This allows quantum computers to process a vast number of possibilities at once, making them potentially much faster for certain types of problems.",
      date: "2025-04-26T10:20:00Z",
    },
    {
      id: "trace-005",
      status: "Pending",
      llmScore: "Pass",
      userMessage: "What are the main causes of climate change?",
      assistantResponse: "The main causes of climate change include:\n1. Burning fossil fuels (coal, oil, gas) which releases greenhouse gases\n2. Deforestation reducing carbon absorption\n3. Industrial processes and agriculture\n4. Transportation emissions\n5. Energy usage in buildings\n\nThese human activities increase greenhouse gas concentrations in the atmosphere, trapping heat and causing global warming.",
      editableOutput: "The main causes of climate change include:\n1. Burning fossil fuels (coal, oil, gas) which releases greenhouse gases\n2. Deforestation reducing carbon absorption\n3. Industrial processes and agriculture\n4. Transportation emissions\n5. Energy usage in buildings\n\nThese human activities increase greenhouse gas concentrations in the atmosphere, trapping heat and causing global warming.",
      date: "2025-04-27T14:05:00Z",
    }
  ];
};

// Update trace record status
export const updateTraceStatus = (traceId: string, status: EvalStatus, records: TraceRecord[]): TraceRecord[] => {
  return records.map(record => 
    record.id === traceId 
      ? { ...record, status } 
      : record
  );
};

// Update trace editable output
export const updateTraceOutput = (traceId: string, output: string, records: TraceRecord[]): TraceRecord[] => {
  return records.map(record => 
    record.id === traceId 
      ? { ...record, editableOutput: output } 
      : record
  );
};
