import React from 'react';

const LazyDashboardPage = React.lazy(() => 
  import('../DashboardPage').then(module => ({
    default: module.default
  }))
);

export default LazyDashboardPage;