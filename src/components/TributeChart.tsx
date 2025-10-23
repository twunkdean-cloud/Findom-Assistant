"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tribute } from '@/context/FindomContext';
import { TrendingUp } from 'lucide-react';

interface TributeChartProps {
  tributes: Tribute[];
}

const TributeChart: React.FC<TributeChartProps> = ({ tributes }) => {
  // Aggregate tributes by month
  const monthlyDataMap = new Map<string, number>();

  tributes.forEach(tribute => {
    const date = new Date(tribute.date);
    const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    monthlyDataMap.set(monthYear, (monthlyDataMap.get(monthYear) || 0) + tribute.amount);
  });

  // Convert map to array of objects for Recharts
  const chartData = Array.from(monthlyDataMap.entries())
    .map(([monthYear, amount]) => ({
      month: monthYear,
      tributes: amount,
    }))
    .sort((a, b) => a.month.localeCompare(b.month)); // Sort by month

  const totalEarnings = chartData.reduce((sum, item) => sum + item.tributes, 0);
  const averageMonthly = chartData.length > 0 ? totalEarnings / chartData.length : 0;
  const highestMonth = chartData.length > 0 ? Math.max(...chartData.map(item => item.tributes)) : 0;

  return (
    <Card className="bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-all duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white">Monthly Tribute Analytics</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUp className="h-4 w-4 text-green-400" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">${totalEarnings.toFixed(2)}</p>
            <p className="text-xs text-gray-500">Total Earnings</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">${averageMonthly.toFixed(2)}</p>
            <p className="text-xs text-gray-500">Monthly Average</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-400">${highestMonth.toFixed(2)}</p>
            <p className="text-xs text-gray-500">Best Month</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-80">
        {chartData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <TrendingUp className="h-12 w-12 text-gray-600 mb-3" />
            <p className="text-gray-500 text-center">No tribute data to display yet.</p>
            <p className="text-gray-600 text-sm mt-1">Start adding tributes to see your earnings trend.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <defs>
                <linearGradient id="colorTributes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                strokeOpacity={0.3}
              />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={(tick) => {
                  const [year, month] = tick.split('-');
                  return new Date(year, parseInt(month) - 1).toLocaleString('default', { month: 'short', year: '2-digit' });
                }} 
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={(tick) => `$${tick}`} 
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--accent))', opacity: 0.1 }}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))', 
                  borderRadius: '0.5rem',
                  padding: '12px'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Tributes']}
                labelFormatter={(label) => {
                  const [year, month] = label.split('-');
                  return new Date(year, parseInt(month) - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
                }}
              />
              <Bar 
                dataKey="tributes" 
                fill="url(#colorTributes)" 
                radius={[8, 8, 0, 0]}
                animationDuration={1000}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default TributeChart;