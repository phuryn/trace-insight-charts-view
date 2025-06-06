
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MainContent from '@/components/MainContent';
import { fetchDailyStats } from '@/services/supabaseQueries';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { ChartBar } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const [showSidebar, setShowSidebar] = React.useState(false);
  const isMobile = useIsMobile();
  
  // Always fetch 30 days of data, but Sidebar component will limit to 7 days
  const { data: stats = [] } = useQuery({
    queryKey: ['dailyStats'],
    queryFn: () => fetchDailyStats(30),
  });

  const toggleSidebar = () => {
    setShowSidebar(prev => !prev);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <div className="bg-gray-100 w-full py-4">
        <div className="max-w-[1200px] w-full mx-auto flex flex-col md:flex-row flex-1 overflow-hidden">
          {(!isMobile || showSidebar) && (
            <Sidebar stats={stats} onClose={isMobile ? toggleSidebar : undefined} />
          )}
          <MainContent />
        </div>
      </div>
      
      {isMobile && !showSidebar && (
        <div className="p-4 bg-white border-t max-w-[1200px] w-full mx-auto">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={toggleSidebar}
          >
            <ChartBar className="mr-2 h-4 w-4" />
            View Statistics
          </Button>
        </div>
      )}
    </div>
  );
};

export default Index;
