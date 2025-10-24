import React from 'react';

const LazySentimentAnalysis = React.lazy(() => 
  import('@/components/SentimentAnalysis').then(module => ({
    default: module.default
  }))
);

export default LazySentimentAnalysis;