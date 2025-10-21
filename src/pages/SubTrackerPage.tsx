import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SubTrackerPage = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-100">Sub Tracker</h2>
      <Card className="bg-gray-800 border border-gray-700 p-4">
        <CardTitle className="text-lg font-semibold mb-3">Coming Soon!</CardTitle>
        <CardContent>
          <p className="text-gray-400">Track your subs, their tributes, preferences, and notes here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubTrackerPage;