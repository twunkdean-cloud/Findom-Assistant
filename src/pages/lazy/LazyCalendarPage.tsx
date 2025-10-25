import React from 'react';

const LazyCalendarPage = React.lazy(() => 
  import('../CalendarPage').then(module => ({
    default: module.default
  }))
);

export default LazyCalendarPage;