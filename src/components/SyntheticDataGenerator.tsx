import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Database } from 'lucide-react';

const SyntheticDataGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateSyntheticData = async () => {
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-synthetic-traces');
      
      if (error) {
        throw error;
      }

      const result = await data;
      
      if (result.success) {
        toast({
          title: "Synthetic Data Generated Successfully",
          description: `Generated ${result.summary.totalTraces} traces with ${result.summary.totalFunctionCalls} function calls across ${result.summary.scenarios} scenarios over ${result.summary.dateRange}.`,
        });
      } else {
        throw new Error(result.error || 'Failed to generate synthetic data');
      }
    } catch (error) {
      console.error('Error generating synthetic data:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to generate synthetic data',
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleGenerateSyntheticData}
      disabled={isGenerating}
      variant="outline"
      className="flex items-center gap-2"
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Database className="h-4 w-4" />
      )}
      {isGenerating ? 'Generating...' : 'Generate Synthetic Data'}
    </Button>
  );
};

export default SyntheticDataGenerator;