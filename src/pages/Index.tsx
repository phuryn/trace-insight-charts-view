
import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MainContent from '@/components/MainContent';
import { DailyStats } from '@/types/trace';
import { getDailyStats } from '@/services/mockData';

const Index = () => {
  const [stats, setStats] = useState<DailyStats[]>([]);

  useEffect(() => {
    // In a real application, this would be an API call
    const fetchedStats = getDailyStats();
    setStats(fetchedStats);
  }, []);

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
