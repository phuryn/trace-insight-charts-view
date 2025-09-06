
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import RecordViewer from './RecordViewer';
import SyntheticDataGenerator from './SyntheticDataGenerator';
import { TraceRecord, EvalStatus } from '@/types/trace';
import { fetchTraceRecords, fetchTraceRecordDetails, updateTraceStatus, updateTraceOutput } from '@/services/supabaseQueries';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Database } from '@/integrations/supabase/types';
import { Filter } from 'lucide-react';
import { Button } from './ui/button';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';

// Define filter types based on Supabase enums
type ToolType = Database['public']['Enums']['tool_type'] | 'All';
type ScenarioType = Database['public']['Enums']['scenario_type'] | 'All';
type StatusType = Database['public']['Enums']['eval_status_type'] | 'All';
type DataSourceType = Database['public']['Enums']['data_source_type'] | 'All';

// Filter interface
interface RecordFilters {
  tool: ToolType;
  scenario: ScenarioType;
  status: StatusType;
  dataSource: DataSourceType;
}

const MainContent = () => {
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const queryClient = useQueryClient();
  
  // Initialize filters with "All" as default values
  const [filters, setFilters] = useState<RecordFilters>({
    tool: 'All',
    scenario: 'All',
    status: 'All',
    dataSource: 'All',
  });

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

  // Fetch all records with filters applied - only essential data
  const { data: records = [], isLoading: isLoadingRecords } = useQuery({
    queryKey: ['traceRecords', filters],
    queryFn: () => fetchTraceRecords(
      filters.tool !== 'All' ? filters.tool : undefined,
      filters.scenario !== 'All' ? filters.scenario : undefined,
      filters.status !== 'All' ? filters.status : undefined,
      filters.dataSource !== 'All' ? filters.dataSource : undefined
    )
  });

  // Effect to reset current index when records change due to filter changes
  useEffect(() => {
    setCurrentIndex(0);
    // If records are loaded, set the selected record to the first one
    if (records.length > 0) {
      setSelectedRecordId(records[0].id);
    } else {
      setSelectedRecordId(null);
    }
  }, [records]);

  // Fetch details for selected record only when needed
  const { data: selectedRecordDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['traceRecord', selectedRecordId],
    queryFn: () => selectedRecordId ? fetchTraceRecordDetails(selectedRecordId) : null,
    enabled: !!selectedRecordId,
    staleTime: 30000, // Cache results for 30 seconds
  });

  // Update record status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, rejectReason }: { id: string; status: EvalStatus; rejectReason?: string }) => 
      updateTraceStatus(id, status, rejectReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['traceRecords'] });
      if (selectedRecordId) {
        queryClient.invalidateQueries({ queryKey: ['traceRecord', selectedRecordId] });
      }
    }
  });

  // Update record output mutation
  const updateOutputMutation = useMutation({
    mutationFn: ({ id, output }: { id: string; output: string }) => 
      updateTraceOutput(id, output),
    onSuccess: () => {
      if (selectedRecordId) {
        queryClient.invalidateQueries({ queryKey: ['traceRecord', selectedRecordId] });
      }
    }
  });

  const handleUpdateStatus = (id: string, status: EvalStatus, rejectReason?: string) => {
    updateStatusMutation.mutate({ id, status, rejectReason });
  };

  const handleUpdateOutput = (id: string, output: string) => {
    updateOutputMutation.mutate({ id, output });
  };

  const handleResetOutput = (id: string) => {
    if (selectedRecordDetails) {
      updateOutputMutation.mutate({ 
        id, 
        output: selectedRecordDetails.assistantResponse || '' 
      });
    }
  };

  // Handle filter changes
  const handleFilterChange = (filterType: keyof RecordFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Navigation handlers - ensure record data is loaded
  const handleNavigate = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < records.length) {
      setCurrentIndex(newIndex);
      const newRecordId = records[newIndex].id;
      setSelectedRecordId(newRecordId);
      
      // Prefetch the next record if available
      if (newIndex + 1 < records.length) {
        const nextRecordId = records[newIndex + 1].id;
        queryClient.prefetchQuery({
          queryKey: ['traceRecord', nextRecordId],
          queryFn: () => fetchTraceRecordDetails(nextRecordId)
        });
      }
    }
  };

  // Combine records with details for the selected record
  const displayRecords = records.map((record, index) => {
    // Only merge details for the currently selected record
    if (record.id === selectedRecordId && selectedRecordDetails) {
      return { 
        ...record,
        ...selectedRecordDetails,
        currentIndex: index 
      };
    }
    return { 
      ...record,
      currentIndex: index 
    };
  });

  return (
    <div className="flex-1 p-6 bg-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Evaluation Records</h2>
        
        <div className="flex items-center gap-3">
          <SyntheticDataGenerator />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="ml-auto">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4 p-2">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Tool</h3>
                <Select 
                  value={filters.tool} 
                  onValueChange={(value) => handleFilterChange('tool', value as ToolType)}
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
                  onValueChange={(value) => handleFilterChange('scenario', value as ScenarioType)}
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

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Status</h3>
                <Select 
                  value={filters.status} 
                  onValueChange={(value) => handleFilterChange('status', value as StatusType)}
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

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Data Source</h3>
                <Select 
                  value={filters.dataSource} 
                  onValueChange={(value) => handleFilterChange('dataSource', value as DataSourceType)}
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
           </PopoverContent>
         </Popover>
        </div>
      </div>
      
      {isLoadingRecords ? (
        <div className="text-gray-500 text-center py-8">
          Loading records...
        </div>
      ) : records.length > 0 ? (
        <RecordViewer 
          records={displayRecords}
          currentIndex={currentIndex}
          onUpdateStatus={handleUpdateStatus}
          onUpdateOutput={handleUpdateOutput}
          onResetOutput={handleResetOutput}
          onNavigate={handleNavigate}
        />
      ) : (
        <div className="text-gray-500 text-center py-8">
          No records found. Try adjusting your filters.
        </div>
      )}
    </div>
  );
};

export default MainContent;
