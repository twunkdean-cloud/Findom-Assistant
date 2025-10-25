import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Tribute } from '@/types';

interface IncomeTrendChartProps {
  tributes: Tribute[];
}

const IncomeTrendChart: React.FC<IncomeTrendChartProps> = ({ tributes }) => {
  const dailyData = tributes.reduce((acc, tribute) => {
    const date = new Date(tribute.date).toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + tribute.amount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(dailyData)
    .map(date => ({
      date,
      amount: dailyData[date],
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (chartData.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-500">No data to display</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
        <XAxis
          dataKey="date"
          stroke="hsl(var(--muted-foreground))"
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          tickFormatter={(tick) => new Date(tick).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          tickFormatter={(tick) => `$${tick}`}
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '0.5rem' }}
          labelStyle={{ color: '#fff' }}
          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Income']}
        />
        <Area type="monotone" dataKey="amount" stroke="#8884d8" fillOpacity={1} fill="url(#colorIncome)" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default IncomeTrendChart;