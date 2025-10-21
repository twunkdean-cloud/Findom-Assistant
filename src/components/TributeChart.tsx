"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tribute } from '@/context/FindomContext';

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

  return (
    <Card className="bg-gray-800 border border-gray-700 p-4">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-100">Monthly Tributes</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        {chartData.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No tribute data to display yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" tickFormatter={(tick) => {
                const [year, month] = tick.split('-');
                return new Date(year, parseInt(month) - 1).toLocaleString('default', { month: 'short', year: '2-digit' });
              }} />
              <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(tick) => `$${tick}`} />
              <Tooltip
                cursor={{ fill: 'hsl(var(--accent))', opacity: 0.1 }}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.5rem' }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Tributes']}
              />
              <Bar dataKey="tributes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default TributeChart;