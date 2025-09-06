
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Database } from '@/integrations/supabase/types';

// Define filter types based on Supabase enums
type ToolType = Database['public']['Enums']['tool_type'] | 'All';
type ScenarioType = Database['public']['Enums']['scenario_type'] | 'All';
type StatusType = Database['public']['Enums']['eval_status_type'] | 'All';
type DataSourceType = Database['public']['Enums']['data_source_type'] | 'All';

// Filter interface
interface RecordFilters {
  tool: ToolType;
  scenario: ScenarioType;
  status?: StatusType; // Make status optional
  dataSource: DataSourceType;
}

interface RecordsFiltersProps {
  filters: RecordFilters;
  onFilterChange: (filterType: keyof RecordFilters, value: string) => void;
  excludeStatus?: boolean; // New prop to exclude status filter
}

const RecordsFilters = ({ filters, onFilterChange, excludeStatus = false }: RecordsFiltersProps) => {
  // Tool options from Supabase enum
  const toolOptions: ToolType[] = [
    'All',
    'ChatGPT',
    'Claude',
    'Gemini',
    'Other'
  ];

  // Scenario options from Supabase enum
  const scenarioOptions: ScenarioType[] = [
    'All',
    'Code Generation',
    'Text Generation',
    'Data Analysis',
    'Creative Writing',
    'Other'
  ];

  // Status options from Supabase enum
  const statusOptions: StatusType[] = [
    'All',
    'Pending',
    'Accepted',
    'Rejected'
  ];

  // Data source options from Supabase enum
  const dataSourceOptions: DataSourceType[] = [
    'All',
    'API',
    'Upload',
    'Manual',
    'Other'
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Tool</h3>
        <Select 
          value={filters.tool} 
          onValueChange={(value) => onFilterChange('tool', value as ToolType)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Tool" />
          </SelectTrigger>
          <SelectContent>
            {toolOptions.map(option => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Scenario</h3>
        <Select 
          value={filters.scenario} 
          onValueChange={(value) => onFilterChange('scenario', value as ScenarioType)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Scenario" />
          </SelectTrigger>
          <SelectContent>
            {scenarioOptions.map(option => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Only show status filter if not excluded */}
      {!excludeStatus && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Status</h3>
          <Select 
            value={filters.status} 
            onValueChange={(value) => onFilterChange('status', value as StatusType)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Data Source</h3>
        <Select 
          value={filters.dataSource} 
          onValueChange={(value) => onFilterChange('dataSource', value as DataSourceType)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Data Source" />
          </SelectTrigger>
          <SelectContent>
            {dataSourceOptions.map(option => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default RecordsFilters;
