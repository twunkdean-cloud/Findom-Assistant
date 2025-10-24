import React from 'react';

const LazyTwitterGeneratorPage = React.lazy(() => 
  import('../TwitterGeneratorPage').then(module => ({
    default: module.default
  }))
);

export default LazyTwitterGeneratorPage;