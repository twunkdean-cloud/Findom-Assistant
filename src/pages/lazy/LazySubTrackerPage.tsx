import React from 'react';

const LazySubTrackerPage = React.lazy(() => 
  import('../SubTrackerPage').then(module => ({
    default: module.default
  }))
);

export default LazySubTrackerPage;