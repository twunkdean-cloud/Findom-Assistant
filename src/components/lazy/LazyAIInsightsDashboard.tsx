import React from 'react';

const LazyAIInsightsDashboard = React.lazy(() => 
  import('@/components/AIInsightsDashboard').then(module => ({
    default: module.default
  }))
);

export default LazyAIInsightsDashboard;