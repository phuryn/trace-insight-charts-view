import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Scenario templates with numbered variations
const templates = {
  'Code Generation': {
    userMessages: [
      'Create a React component for user profile with {index} different props',
      'Build a Python function to process {index} data entries',
      'Generate a SQL query to join {index} tables',
      'Write a TypeScript interface for {index} user fields',
      'Create an API endpoint to handle {index} different request types'
    ],
    assistantResponses: [
      'Here\'s a React component with {index} props for user profile display...',
      'I\'ve created a Python function that efficiently processes {index} data entries...',
      'This SQL query joins {index} tables with proper indexing...',
      'Here\'s a TypeScript interface defining {index} user fields...',
      'I\'ve built an API endpoint handling {index} request types...'
    ],
    functionCalls: ['execute_code', 'analyze_syntax', 'suggest_improvements', 'validate_code', 'optimize_performance']
  },
  'Text Generation': {
    userMessages: [
      'Write a {index}-word article about machine learning trends',
      'Create a summary of a {index}-page research document',
      'Generate {index} email templates for customer outreach',
      'Write a {index}-paragraph blog post about productivity',
      'Create {index} social media posts for product launch'
    ],
    assistantResponses: [
      'I\'ve written a comprehensive {index}-word article covering the latest ML trends...',
      'Here\'s a concise summary of the {index}-page research document...',
      'I\'ve created {index} effective email templates for your outreach campaign...',
      'This {index}-paragraph blog post covers key productivity strategies...',
      'Here are {index} engaging social media posts for your product launch...'
    ],
    functionCalls: ['check_grammar', 'generate_content', 'optimize_readability', 'fact_check', 'enhance_style']
  },
  'Data Analysis': {
    userMessages: [
      'Analyze sales data from {index} different regions',
      'Create a visualization showing {index} key metrics',
      'Generate insights from {index} months of user behavior data',
      'Build a dashboard displaying {index} performance indicators',
      'Process {index} CSV files and identify trends'
    ],
    assistantResponses: [
      'I\'ve analyzed sales data from {index} regions showing clear patterns...',
      'Here\'s a comprehensive visualization of {index} key metrics...',
      'The analysis of {index} months reveals interesting user behavior trends...',
      'I\'ve created a dashboard showing {index} critical performance indicators...',
      'After processing {index} CSV files, I\'ve identified several key trends...'
    ],
    functionCalls: ['process_data', 'create_visualization', 'calculate_metrics', 'identify_patterns', 'generate_report']
  },
  'Creative Writing': {
    userMessages: [
      'Write a {index}-chapter short story about time travel',
      'Create {index} character descriptions for a fantasy novel',
      'Generate {index} different plot twists for a mystery story',
      'Write {index} verses for a song about friendship',
      'Create {index} dialogue examples between conflicted characters'
    ],
    assistantResponses: [
      'I\'ve crafted a compelling {index}-chapter story exploring time travel themes...',
      'Here are {index} richly detailed character descriptions for your fantasy world...',
      'I\'ve generated {index} unexpected plot twists that will surprise readers...',
      'These {index} verses capture the essence of true friendship...',
      'Here are {index} dialogue examples showing character conflict and depth...'
    ],
    functionCalls: ['enhance_creativity', 'check_style', 'suggest_variations', 'improve_flow', 'add_details']
  },
  'Other': {
    userMessages: [
      'Help me plan {index} activities for team building',
      'Create a checklist with {index} items for project management',
      'Generate {index} questions for customer interviews',
      'Design {index} workflows for content approval',
      'Suggest {index} optimization strategies for workflow'
    ],
    assistantResponses: [
      'I\'ve planned {index} engaging team building activities...',
      'Here\'s a comprehensive checklist with {index} essential project items...',
      'I\'ve generated {index} insightful questions for customer interviews...',
      'These {index} workflows will streamline your content approval process...',
      'Here are {index} proven strategies to optimize your workflow...'
    ],
    functionCalls: ['organize_tasks', 'prioritize_items', 'schedule_activities', 'track_progress', 'optimize_process']
  }
};

const tools = ['ChatGPT', 'Claude', 'Gemini', 'Other'];
const dataSources = ['API', 'Upload', 'Manual', 'Other'];
const statuses = ['Pending', 'Accepted', 'Rejected'];
const llmScores = ['Pass', 'Fail'];

const rejectReasons = [
  'Content quality below standards',
  'Incorrect technical implementation',
  'Missing required information',
  'Not aligned with requirements',
  'Factual inaccuracies detected'
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getWeightedTool(): string {
  const rand = Math.random();
  if (rand < 0.4) return 'ChatGPT';
  if (rand < 0.7) return 'Claude';
  if (rand < 0.9) return 'Gemini';
  return 'Other';
}

function getWeightedStatus(): string {
  const rand = Math.random();
  if (rand < 0.6) return 'Accepted';
  if (rand < 0.85) return 'Pending';
  return 'Rejected';
}

function getCorrelatedLLMScore(status: string): string {
  if (status === 'Accepted') {
    return Math.random() < 0.8 ? 'Pass' : 'Fail';
  } else if (status === 'Rejected') {
    return Math.random() < 0.7 ? 'Fail' : 'Pass';
  }
  return Math.random() < 0.5 ? 'Pass' : 'Fail';
}

function generateDateInLast30Days(): string {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  const date = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
  
  // Prefer business hours (9 AM to 6 PM)
  const hour = Math.random() < 0.7 ? 9 + Math.floor(Math.random() * 9) : Math.floor(Math.random() * 24);
  const minute = Math.floor(Math.random() * 60);
  
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting synthetic trace generation...');

    const traces = [];
    const functionCalls = [];
    const scenarios = Object.keys(templates);

    for (const scenario of scenarios) {
      console.log(`Generating traces for scenario: ${scenario}`);
      
      for (let i = 1; i <= 100; i++) {
        const template = templates[scenario as keyof typeof templates];
        const tool = getWeightedTool();
        const dataSource = getRandomElement(dataSources);
        const status = getWeightedStatus();
        const llmScore = getCorrelatedLLMScore(status);
        const createdAt = generateDateInLast30Days();
        
        const traceId = crypto.randomUUID();
        const index = Math.max(1, Math.floor(Math.random() * 50) + 1);
        
        const userMessage = getRandomElement(template.userMessages).replace('{index}', index.toString());
        const assistantResponse = getRandomElement(template.assistantResponses).replace('{index}', index.toString());
        
        // Generate function calls (1-3 per trace)
        const numFunctionCalls = Math.floor(Math.random() * 3) + 1;
        const traceFunctionCalls = [];
        
        for (let j = 0; j < numFunctionCalls; j++) {
          const functionCall = {
            id: crypto.randomUUID(),
            trace_id: traceId,
            function_name: getRandomElement(template.functionCalls),
            function_arguments: { 
              input: userMessage,
              parameters: { complexity: index, scenario: scenario.toLowerCase() }
            },
            function_response: {
              success: status !== 'Rejected',
              result: `Processed ${scenario.toLowerCase()} task with complexity ${index}`,
              timestamp: createdAt
            },
            created_at: createdAt
          };
          
          traceFunctionCalls.push(functionCall);
          functionCalls.push(functionCall);
        }

        const trace = {
          id: traceId,
          user_message: userMessage,
          assistant_response: assistantResponse,
          llm_score: llmScore,
          status: status,
          tool: tool,
          scenario: scenario,
          data_source: dataSource,
          reject_reason: status === 'Rejected' ? getRandomElement(rejectReasons) : null,
          editable_output: status === 'Accepted' ? assistantResponse : null,
          created_at: createdAt,
          updated_at: createdAt
        };

        traces.push(trace);
      }
    }

    console.log(`Generated ${traces.length} traces and ${functionCalls.length} function calls`);

    // Insert traces in batches
    const batchSize = 100;
    for (let i = 0; i < traces.length; i += batchSize) {
      const batch = traces.slice(i, i + batchSize);
      const { error: traceError } = await supabaseClient
        .from('llm_traces')
        .insert(batch);
      
      if (traceError) {
        console.error('Error inserting trace batch:', traceError);
        throw traceError;
      }
    }

    // Insert function calls in batches
    for (let i = 0; i < functionCalls.length; i += batchSize) {
      const batch = functionCalls.slice(i, i + batchSize);
      const { error: functionError } = await supabaseClient
        .from('llm_function_calls')
        .insert(batch);
      
      if (functionError) {
        console.error('Error inserting function call batch:', functionError);
        throw functionError;
      }
    }

    console.log('Successfully generated synthetic data');

    return new Response(JSON.stringify({
      success: true,
      message: `Generated ${traces.length} traces with ${functionCalls.length} function calls`,
      summary: {
        totalTraces: traces.length,
        totalFunctionCalls: functionCalls.length,
        scenarios: scenarios.length,
        dateRange: '30 days'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-synthetic-traces function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});