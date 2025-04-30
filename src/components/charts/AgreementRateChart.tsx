
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
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
  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle className="text-sm text-gray-600 font-medium">
          LLM ↔ Human Agreement Rate
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[120px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis 
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tickCount={3}
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="agreementRate"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgreementRateChart;
