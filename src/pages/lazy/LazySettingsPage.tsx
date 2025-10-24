import React from 'react';

const LazySettingsPage = React.lazy(() => 
  import('../SettingsPage').then(module => ({
    default: module.default
  }))
);

export default LazySettingsPage;