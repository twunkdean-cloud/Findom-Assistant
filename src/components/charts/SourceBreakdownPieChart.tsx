import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Tribute } from '@/types';

interface SourceBreakdownPieChartProps {
  tributes: Tribute[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const SourceBreakdownPieChart: React.FC<SourceBreakdownPieChartProps> = ({ tributes }) => {
  const sourceData = tributes.reduce((acc, tribute) => {
    const source = tribute.source || 'other';
    acc[source] = (acc[source] || 0) + tribute.amount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(sourceData).map(source => ({
    name: source.charAt(0).toUpperCase() + source.slice(1),
    value: sourceData[source],
  }));

  if (chartData.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-500" role="status">No data to display</div>;
  }

  // Calculate summary statistics for aria-label
  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  const largestSource = chartData.reduce((max, item) =>
    item.value > max.value ? item : max, chartData[0]);
  const sourceBreakdown = chartData
    .map(item => `${item.name}: $${item.value.toFixed(2)} (${((item.value / total) * 100).toFixed(1)}%)`)
    .join(', ');

  const ariaLabel = `Earnings by source pie chart. Total: $${total.toFixed(2)} from ${chartData.length} sources. Largest source: ${largestSource.name} with $${largestSource.value.toFixed(2)}. Breakdown: ${sourceBreakdown}`;

  return (
    <div role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart aria-hidden="true">
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => `$${value.toFixed(2)}`}
            contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '0.5rem' }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SourceBreakdownPieChart;