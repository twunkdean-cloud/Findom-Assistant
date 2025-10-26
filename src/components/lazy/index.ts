import { lazy } from 'react';

// AI Components
export const LazyAIChatbot = lazy(() => import('../AIChatbot'));
export const LazyAIContentSuggestions = lazy(() => import('../AIContentSuggestions'));
export const LazyAIInsightsDashboard = lazy(() => import('../AIInsightsDashboard'));
export const LazySentimentAnalysis = lazy(() => import('../SentimentAnalysis'));

// Chart Components
// No lazy loaded chart components in this file anymore

// Utility Components
export const LazyMigrationHelper = lazy(() => import('../MigrationHelper'));
export const LazyPushNotificationManager = lazy(() => import('../PushNotificationManager'));