
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChartBar } from 'lucide-react';
import { DailyStats } from '@/types/trace';
import AgreementRateChart from './charts/AgreementRateChart';
import AcceptanceRateChart from './charts/AcceptanceRateChart';

interface SidebarProps {
  stats: DailyStats[];
}

const Sidebar = ({ stats }: SidebarProps) => {
  // Always limit to the last 7 days of data on the home page
  const recentStats = stats.slice(-7);

  return (
    <aside className="w-full md:w-64 bg-gray-50 p-4 border-r">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Statistics</h2>
        <Link to="/reports">
          <Button variant="outline" size="sm">
            <ChartBar className="mr-2 h-4 w-4" />
            View Reports
          </Button>
        </Link>
      </div>
      <div className="space-y-4 w-full">
        <AgreementRateChart data={recentStats} />
        <AcceptanceRateChart data={recentStats} />
      </div>
    </aside>
  );
};

export default Sidebar;
