import React from 'react';

const LazyTributeChart = React.lazy(() => 
  import('@/components/TributeChart').then(module => ({
    default: module.default
  }))
);

export default LazyTributeChart;