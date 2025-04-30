
import React from 'react';
import { DailyStats } from '@/types/trace';
import AgreementRateChart from './charts/AgreementRateChart';
import AcceptanceRateChart from './charts/AcceptanceRateChart';

interface SidebarProps {
  stats: DailyStats[];
}

const Sidebar = ({ stats }: SidebarProps) => {
  // Only use the last 7 days of data
  const recentStats = stats.slice(-7);

  return (
    <aside className="w-full md:w-64 bg-gray-50 p-4 border-r">
      <h2 className="text-lg font-medium mb-4">Statistics</h2>
      <div className="space-y-4 w-full">
        <AgreementRateChart data={recentStats} />
        <AcceptanceRateChart data={recentStats} />
      </div>
    </aside>
  );
};

export default Sidebar;
