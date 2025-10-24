import React from 'react';

const LazyImageVisionPage = React.lazy(() => 
  import('../ImageVisionPage').then(module => ({
    default: module.default
  }))
);

export default LazyImageVisionPage;