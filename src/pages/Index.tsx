
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MainContent from '@/components/MainContent';
import { fetchDailyStats } from '@/services/supabaseQueries';

const Index = () => {
  const { data: stats = [] } = useQuery({
    queryKey: ['dailyStats'],
    queryFn: () => fetchDailyStats(30), // Fetch up to 30 days of stats
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        <Sidebar stats={stats} />
        <MainContent />
      </div>
    </div>
  );
};

export default Index;
