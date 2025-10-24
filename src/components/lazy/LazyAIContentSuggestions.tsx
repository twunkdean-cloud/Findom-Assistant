import React from 'react';

const LazyAIContentSuggestions = React.lazy(() => 
  import('@/components/AIContentSuggestions').then(module => ({
    default: module.default
  }))
);

export default LazyAIContentSuggestions;