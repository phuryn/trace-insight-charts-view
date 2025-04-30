
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatDate } from '@/lib/utils';
import { DailyStats } from '@/types/trace';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-md border rounded-md">
        <p className="font-semibold">{formatDate(label || '')}</p>
        <p className="text-blue-600">
          Agreement Rate: {payload[0].value.toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
};

interface AgreementRateChartProps {
  data: DailyStats[];
}

const AgreementRateChart = ({ data }: AgreementRateChartProps) => {
  // Check if data is empty or all agreement rate values are 0
  const hasData = data.length > 0 && data.some(item => item.agreementRate > 0);

  return (
    <Card className="w-full">
      <CardHeader className="pb-0 mb-4">
        <CardTitle className="text-sm text-gray-600 font-medium">LLM ↔ Human Agreement</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[120px] w-full">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 20, left: -5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate} 
                  tick={{ fontSize: 10 }} 
                  axisLine={{ stroke: '#e0e0e0' }} 
                  tickLine={{ stroke: '#e0e0e0' }}
                />
                <YAxis 
                  domain={[0, 100]} 
                  tickCount={3} 
                  tick={{ fontSize: 10 }} 
                  axisLine={{ stroke: '#e0e0e0' }} 
                  tickLine={{ stroke: '#e0e0e0' }}
                  tickFormatter={value => `${value}%`}
                  width={40}
                  dx={-2}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="agreementRate" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  dot={{ r: 4, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <p className="text-sm text-muted-foreground">No agreement data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AgreementRateChart;
