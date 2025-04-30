
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

interface TimeRangeFilterProps {
  value: 7 | 30 | 90;
  onChange: (value: 7 | 30 | 90) => void;
}

const TimeRangeFilter = ({ value, onChange }: TimeRangeFilterProps) => {
  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-gray-500" />
      <div className="flex rounded-md border border-gray-300 overflow-hidden">
        <Button
          variant="ghost"
          size="sm"
          className={`px-3 rounded-none ${value === 7 ? 'bg-gray-100' : ''}`}
          onClick={() => onChange(7)}
        >
          Week
        </Button>
        <div className="w-px bg-gray-300"></div>
        <Button
          variant="ghost"
          size="sm"
          className={`px-3 rounded-none ${value === 30 ? 'bg-gray-100' : ''}`}
          onClick={() => onChange(30)}
        >
          Month
        </Button>
        <div className="w-px bg-gray-300"></div>
        <Button
          variant="ghost"
          size="sm"
          className={`px-3 rounded-none ${value === 90 ? 'bg-gray-100' : ''}`}
          onClick={() => onChange(90)}
        >
          Quarter
        </Button>
      </div>
    </div>
  );
};

export default TimeRangeFilter;
