import React from 'react';

const LazyRedditGeneratorPage = React.lazy(() => 
  import('../RedditGeneratorPage').then(module => ({
    default: module.default
  }))
);

export default LazyRedditGeneratorPage;