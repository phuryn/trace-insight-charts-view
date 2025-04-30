
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import RecordViewer from './RecordViewer';
import { TraceRecord, EvalStatus } from '@/types/trace';
import { fetchTraceRecords, fetchTraceRecordDetails, updateTraceStatus, updateTraceOutput } from '@/services/supabaseQueries';

const MainContent = () => {
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch all records (with minimal data)
  const { data: records = [], isLoading: isLoadingRecords } = useQuery({
    queryKey: ['traceRecords'],
    queryFn: fetchTraceRecords
  });

  // Fetch details for selected record
  const { data: selectedRecordDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['traceRecord', selectedRecordId],
    queryFn: () => selectedRecordId ? fetchTraceRecordDetails(selectedRecordId) : null,
    enabled: !!selectedRecordId
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

  useEffect(() => {
    // Set the first record as selected when records load
    if (records.length > 0 && !selectedRecordId) {
      setSelectedRecordId(records[0].id);
    }
  }, [records, selectedRecordId]);

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
        output: selectedRecordDetails.assistantResponse 
      });
    }
  };

  // Combine records with details for the selected record
  const recordsWithDetails = records.map(record => 
    record.id === selectedRecordId && selectedRecordDetails
      ? { ...selectedRecordDetails }
      : record
  );

  return (
    <div className="flex-1 p-6 bg-white">
      <h2 className="text-xl font-semibold mb-4">Evaluation Records</h2>
      {isLoadingRecords ? (
        <div className="text-gray-500 text-center py-8">
          Loading records...
        </div>
      ) : records.length > 0 ? (
        <RecordViewer 
          records={recordsWithDetails}
          onUpdateStatus={handleUpdateStatus}
          onUpdateOutput={handleUpdateOutput}
          onResetOutput={handleResetOutput}
        />
      ) : (
        <div className="text-gray-500 text-center py-8">
          No records found.
        </div>
      )}
    </div>
  );
};

export default MainContent;
