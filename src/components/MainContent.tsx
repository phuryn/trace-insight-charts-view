
import React, { useState, useEffect } from 'react';
import RecordViewer from './RecordViewer';
import { TraceRecord, EvalStatus } from '@/types/trace';
import { getTraceRecords, updateTraceStatus, updateTraceOutput } from '@/services/traceRecords';

const MainContent = () => {
  const [records, setRecords] = useState<TraceRecord[]>([]);

  useEffect(() => {
    // In a real application, this would be an API call
    const fetchedRecords = getTraceRecords();
    setRecords(fetchedRecords);
  }, []);

  const handleUpdateStatus = (id: string, status: EvalStatus, rejectReason?: string) => {
    setRecords(prevRecords => {
      const updatedRecords = updateTraceStatus(id, status, prevRecords);
      if (rejectReason && status === 'Rejected') {
        return updatedRecords.map(record => 
          record.id === id 
            ? { ...record, rejectReason } 
            : record
        );
      }
      return updatedRecords;
    });
  };

  const handleUpdateOutput = (id: string, output: string) => {
    setRecords(prevRecords => updateTraceOutput(id, output, prevRecords));
  };

  const handleResetOutput = (id: string) => {
    setRecords(prevRecords => 
      prevRecords.map(record => 
        record.id === id 
          ? { ...record, editableOutput: record.assistantResponse, rejectReason: undefined } 
          : record
      )
    );
  };

  return (
    <div className="flex-1 p-6 bg-white">
      <h2 className="text-xl font-semibold mb-4">Evaluation Records</h2>
      {records.length > 0 ? (
        <RecordViewer 
          records={records}
          onUpdateStatus={handleUpdateStatus}
          onUpdateOutput={handleUpdateOutput}
          onResetOutput={handleResetOutput}
        />
      ) : (
        <div className="text-gray-500 text-center py-8">
          Loading records...
        </div>
      )}
    </div>
  );
};

export default MainContent;
