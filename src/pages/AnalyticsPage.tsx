import React from 'react';
import { useAppData } from '@/context/FindomContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, TrendingUp, PieChart } from 'lucide-react';
import IncomeTrendChart from '@/components/charts/IncomeTrendChart';
import TopSubsCard from '@/components/charts/TopSubsCard';
import SourceBreakdownPieChart from '@/components/charts/SourceBreakdownPieChart';

const AnalyticsPage = () => {
  const appData = useAppData();
  const { tributes, subs } = appData;

  const totalRevenue = tributes.reduce((sum, t) => sum + t.amount, 0);
  const averageTribute = tributes.length > 0 ? totalRevenue / tributes.length : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Financial Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Number of Tributes</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{tributes.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Average Tribute</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${averageTribute.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Subs</CardTitle>
            <Users className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{subs.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-indigo-400" />
            Income Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="h-96">
          <IncomeTrendChart tributes={tributes} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white flex items-center">
              <PieChart className="mr-2 h-5 w-5 text-green-400" />
              Earnings by Source
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <SourceBreakdownPieChart tributes={tributes} />
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white flex items-center">
              <Users className="mr-2 h-5 w-5 text-yellow-400" />
              Top Subs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TopSubsCard subs={subs} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;