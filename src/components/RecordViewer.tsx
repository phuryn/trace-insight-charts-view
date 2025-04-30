
import React, { useState, useEffect } from 'react';
import { TraceRecord, EvalStatus } from '@/types/trace';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Check, X, RotateCcw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface RecordViewerProps {
  records: TraceRecord[];
  onUpdateStatus: (id: string, status: EvalStatus, rejectReason?: string) => void;
  onUpdateOutput: (id: string, output: string) => void;
  onResetOutput: (id: string) => void;
}

const RecordViewer = ({
  records,
  onUpdateStatus,
  onUpdateOutput,
  onResetOutput,
}: RecordViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const { toast } = useToast();

  const currentRecord = records[currentIndex];
  
  // Reset current index when records change
  useEffect(() => {
    if (records.length > 0 && currentIndex >= records.length) {
      setCurrentIndex(0);
    }
  }, [records, currentIndex]);
  
  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < records.length - 1 ? prev + 1 : prev));
  };

  const handleOutputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdateOutput(currentRecord.id, e.target.value);
  };

  const handleAccept = () => {
    onUpdateStatus(currentRecord.id, 'Accepted');
    toast({
      title: "Record Accepted",
      description: "The record has been marked as accepted.",
    });
  };

  const handleReject = () => {
    setRejectDialogOpen(true);
  };

  const submitReject = () => {
    onUpdateStatus(currentRecord.id, 'Rejected', rejectReason);
    setRejectDialogOpen(false);
    setRejectReason('');
    toast({
      title: "Record Rejected",
      description: "The record has been marked as rejected.",
    });
  };

  const handleReset = () => {
    onResetOutput(currentRecord.id);
    onUpdateStatus(currentRecord.id, 'Pending');
    toast({
      title: "Record Reset",
      description: "The record has been reset to pending status.",
    });
  };

  if (!currentRecord) return <div>No records to display</div>;
  
  // Check if we have full details for the current record
  const hasFullDetails = !!currentRecord.assistantResponse;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Record Reviewer</CardTitle>
          <div className="text-sm text-muted-foreground">
            Record {currentIndex + 1} of {records.length}
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="functions">Functions</TabsTrigger>
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="space-y-4 mt-4">
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="font-semibold mb-2">User</div>
                <div className="whitespace-pre-wrap">{currentRecord.userMessage}</div>
              </div>
              
              {hasFullDetails ? (
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="font-semibold mb-2">Assistant</div>
                  <div className="whitespace-pre-wrap">{currentRecord.assistantResponse}</div>
                </div>
              ) : (
                <div className="bg-blue-50 rounded-lg p-4 flex items-center justify-center min-h-[100px]">
                  <div className="text-center text-muted-foreground">
                    Loading assistant response...
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="functions" className="mt-4">
              {hasFullDetails && currentRecord.metadata?.functionCalls?.length > 0 ? (
                <div className="space-y-4">
                  {currentRecord.metadata.functionCalls.map((call, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="font-medium mb-2">{call.function_name}</div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Arguments</div>
                          <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                            {JSON.stringify(call.function_arguments, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Response</div>
                          <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                            {JSON.stringify(call.function_response, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 border rounded-lg">
                  <div className="text-center text-muted-foreground">
                    {hasFullDetails ? "No function calls in this interaction" : "Loading function calls..."}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="metadata" className="mt-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-2">
                  <div className="font-medium">Trace ID:</div>
                  <div>{currentRecord.id}</div>
                </div>
                <div className="grid grid-cols-2">
                  <div className="font-medium">Date:</div>
                  <div>{new Date(currentRecord.date).toLocaleString()}</div>
                </div>
                <div className="grid grid-cols-2">
                  <div className="font-medium">Status:</div>
                  <div>
                    <span 
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        currentRecord.status === 'Accepted' ? 'bg-green-100 text-green-800' : 
                        currentRecord.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {currentRecord.status}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2">
                  <div className="font-medium">LLM Score:</div>
                  <div>
                    <span 
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        currentRecord.llmScore === 'Pass' ? 'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      {currentRecord.llmScore}
                    </span>
                  </div>
                </div>
                {currentRecord.rejectReason && (
                  <div className="grid grid-cols-2">
                    <div className="font-medium">Reject Reason:</div>
                    <div>{currentRecord.rejectReason}</div>
                  </div>
                )}
                {currentRecord.metadata?.toolName && (
                  <div className="grid grid-cols-2">
                    <div className="font-medium">Tool:</div>
                    <div>{currentRecord.metadata.toolName}</div>
                  </div>
                )}
                {currentRecord.metadata?.scenario && (
                  <div className="grid grid-cols-2">
                    <div className="font-medium">Scenario:</div>
                    <div>{currentRecord.metadata.scenario}</div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">
              Editable Output
            </label>
            {hasFullDetails ? (
              <Textarea 
                value={currentRecord.editableOutput} 
                onChange={handleOutputChange}
                className="min-h-[150px]"
              />
            ) : (
              <div className="min-h-[150px] border rounded-md flex items-center justify-center">
                <div className="text-muted-foreground">Loading editable output...</div>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button onClick={handlePrevious} disabled={currentIndex === 0} variant="outline" size="sm">
              <ChevronLeft className="mr-1 h-4 w-4" /> Previous
            </Button>
            <Button onClick={handleNext} disabled={currentIndex === records.length - 1} variant="outline" size="sm">
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleReset} variant="outline" size="sm" disabled={!hasFullDetails}>
              <RotateCcw className="mr-1 h-4 w-4" /> Reset
            </Button>
            <Button onClick={handleReject} variant="destructive" size="sm" disabled={!hasFullDetails}>
              <X className="mr-1 h-4 w-4" /> Reject
            </Button>
            <Button onClick={handleAccept} variant="default" size="sm" disabled={!hasFullDetails}>
              <Check className="mr-1 h-4 w-4" /> Accept
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Record</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this record.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Enter rejection reason"
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitReject} disabled={!rejectReason.trim()}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecordViewer;
