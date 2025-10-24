import React from 'react';

const LazyTaskGeneratorPage = React.lazy(() => 
  import('../TaskGeneratorPage').then(module => ({
    default: module.default
  }))
);

export default LazyTaskGeneratorPage;