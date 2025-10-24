import React from 'react';

const LazyTributeTrackerPage = React.lazy(() => 
  import('../TributeTrackerPage').then(module => ({
    default: module.default
  }))
);

export default LazyTributeTrackerPage;