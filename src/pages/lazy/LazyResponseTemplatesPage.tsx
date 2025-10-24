import React from 'react';

const LazyResponseTemplatesPage = React.lazy(() => 
  import('../ResponseTemplatesPage').then(module => ({
    default: module.default
  }))
);

export default LazyResponseTemplatesPage;