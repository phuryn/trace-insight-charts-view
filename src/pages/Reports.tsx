
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChartBar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchDailyStats } from '@/services/supabaseQueries';
import AgreementRateChart from '@/components/charts/AgreementRateChart';
import AcceptanceRateChart from '@/components/charts/AcceptanceRateChart';
import TimeRangeFilter from '@/components/TimeRangeFilter';
import RecordsFilters from '@/components/RecordsFilters';
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
  status: StatusType;
  dataSource: DataSourceType;
}

const Reports = () => {
  // State for time range filter (7, 30, or 90 days)
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30);
  
  // Initialize filters with "All" as default values
  const [filters, setFilters] = useState<RecordFilters>({
    tool: 'All',
    scenario: 'All',
    status: 'All',
    dataSource: 'All',
  });

  // Fetch stats data with the selected time range
  const { data: stats = [], isLoading } = useQuery({
    queryKey: ['dailyStats', timeRange],
    queryFn: () => fetchDailyStats(timeRange),
  });

  // Handle filter changes
  const handleFilterChange = (filterType: keyof RecordFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-xl font-semibold flex items-center">
                <ChartBar className="mr-2 h-5 w-5" />
                Detailed Reports
              </h1>
            </div>
            <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium mb-4">Filters</h2>
          <RecordsFilters filters={filters} onFilterChange={handleFilterChange} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <AgreementRateChart data={stats} />
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <AcceptanceRateChart data={stats} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
