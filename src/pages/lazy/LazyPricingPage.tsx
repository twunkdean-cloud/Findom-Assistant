import React from 'react';

const LazyPricingPage = React.lazy(() => 
  import('../PricingPage').then(module => ({
    default: module.default
  }))
);

export default LazyPricingPage;