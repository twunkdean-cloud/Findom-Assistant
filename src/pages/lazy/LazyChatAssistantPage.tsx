import React from 'react';

const LazyChatAssistantPage = React.lazy(() => 
  import('../ChatAssistantPage').then(module => ({
    default: module.default
  }))
);

export default LazyChatAssistantPage;