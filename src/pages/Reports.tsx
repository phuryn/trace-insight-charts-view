
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
import Header from '@/components/Header';

// Define filter types based on Supabase enums
type ToolType = Database['public']['Enums']['tool_type'] | 'All';
type ScenarioType = Database['public']['Enums']['scenario_type'] | 'All';
type DataSourceType = Database['public']['Enums']['data_source_type'] | 'All';

// Filter interface - removed Status
interface RecordFilters {
  tool: ToolType;
  scenario: ScenarioType;
  dataSource: DataSourceType;
}

const Reports = () => {
  // State for time range filter (7, 30, or 90 days)
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30);
  
  // Initialize filters with "All" as default values (removed status)
  const [filters, setFilters] = useState<RecordFilters>({
    tool: 'All',
    scenario: 'All',
    dataSource: 'All',
  });

  // Fetch stats data with the selected time range and filters (no status filter)
  const { data: stats = [], isLoading, error } = useQuery({
    queryKey: ['dailyStats', timeRange, filters],
    queryFn: () => fetchDailyStats(
      timeRange,
      filters.tool !== 'All' ? filters.tool : undefined,
      filters.scenario !== 'All' ? filters.scenario : undefined,
      undefined, // No status filter
      filters.dataSource !== 'All' ? filters.dataSource : undefined
    ),
  });

  // Add console log to debug data issues
  console.log('Reports data:', { stats, isLoading, error, timeRange, filters });

  // Handle filter changes
  const handleFilterChange = (filterType: keyof RecordFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-[1200px] w-full mx-auto px-6 py-4">
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

      <div className="bg-gray-100 py-4">
        <div className="max-w-[1200px] w-full mx-auto px-6 py-2">
          <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-4">Filters</h2>
            <RecordsFilters 
              filters={filters} 
              onFilterChange={handleFilterChange} 
              excludeStatus={true} 
            />
          </div>

          {isLoading ? (
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <p>Loading statistics...</p>
            </div>
          ) : error ? (
            <div className="bg-white p-8 rounded-lg shadow-sm text-center text-red-500">
              <p>Error loading statistics. Please try again later.</p>
            </div>
          ) : stats.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <p>No data available for the selected time range and filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <AgreementRateChart data={stats} height={240} />
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <AcceptanceRateChart data={stats} height={240} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
