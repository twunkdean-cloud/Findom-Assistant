import React from 'react';

const LazyChecklistPage = React.lazy(() => 
  import('../ChecklistPage').then(module => ({
    default: module.default
  }))
);

export default LazyChecklistPage;