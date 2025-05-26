
# Database Migrations

This directory contains SQL migration files for the LLM Traces application.

## Migration Files

- `20250126000000_initial_schema.sql` - Initial database schema with tables, enums, functions, and indexes

## How to Use

### For new Supabase projects:
1. Create a new Supabase project
2. Run the migration files in order using the Supabase SQL Editor
3. Add appropriate RLS (Row Level Security) policies based on your authentication requirements

### For existing projects:
- These migrations can be used as reference to understand the database structure
- Use individual CREATE statements as needed

## Schema Overview

### Tables
- `users` - User accounts with roles (Inspector, Reviewer, Admin)
- `llm_traces` - Main traces table with LLM interactions and evaluations
- `llm_function_calls` - Function calls associated with traces

### Custom Types
- `user_role` - User permission levels
- `eval_status_type` - Evaluation status (Pending, Accepted, Rejected)
- `llm_score_type` - LLM scoring (Pass, Fail)
- `tool_type` - Available tools
- `scenario_type` - Interaction scenarios
- `data_source_type` - Data source types

### Functions
- `get_user_role(user_id)` - Get user role by ID
- `get_daily_stats(days_limit)` - Get daily statistics
- `get_daily_stats_filtered(...)` - Get filtered daily statistics

## Security Notes

- Row Level Security (RLS) is enabled on all tables
- Functions use SECURITY DEFINER for proper permission handling
- Adjust RLS policies based on your specific authentication and authorization requirements

## Indexes

Performance indexes are included for:
- Date-based queries on traces
- Status, tool, scenario, and data source filtering
- Foreign key relationships
