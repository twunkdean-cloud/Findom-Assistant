import React from 'react';

const LazyAIChatbot = React.lazy(() => 
  import('@/components/AIChatbot').then(module => ({
    default: module.default
  }))
);

export default LazyAIChatbot;