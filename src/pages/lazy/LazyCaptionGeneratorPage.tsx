import React from 'react';

const LazyCaptionGeneratorPage = React.lazy(() => 
  import('../CaptionGeneratorPage').then(module => ({
    default: module.default
  }))
);

export default LazyCaptionGeneratorPage;