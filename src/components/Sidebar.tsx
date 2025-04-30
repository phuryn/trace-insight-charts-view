
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChartBar, X } from 'lucide-react';
import { DailyStats } from '@/types/trace';
import AgreementRateChart from './charts/AgreementRateChart';
import AcceptanceRateChart from './charts/AcceptanceRateChart';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarProps {
  stats: DailyStats[];
  onClose?: () => void;
}

const Sidebar = ({ stats, onClose }: SidebarProps) => {
  const isMobile = useIsMobile();
  // Always limit to the last 7 days of data on the home page
  const recentStats = stats.slice(-7);

  return (
    <aside className={`${isMobile ? 'fixed inset-0 z-50 bg-gray-50/95' : 'w-full md:w-64 bg-gray-50'} p-4 border-r`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Statistics</h2>
        {isMobile && onClose ? (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        ) : (
          <Link to="/reports">
            <Button variant="outline" size="sm">
              <ChartBar className="mr-2 h-4 w-4" />
              View Reports
            </Button>
          </Link>
        )}
      </div>
      <div className="space-y-4 w-full">
        <AgreementRateChart data={recentStats} />
        <AcceptanceRateChart data={recentStats} />
      </div>
      {isMobile && (
        <div className="mt-6">
          <Link to="/reports">
            <Button className="w-full">
              <ChartBar className="mr-2 h-4 w-4" />
              View Full Reports
            </Button>
          </Link>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
