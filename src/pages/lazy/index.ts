import { lazy } from 'react';

// Core pages
export const LazyIndex = lazy(() => import('../Index'));
export const LazyLoginPage = lazy(() => import('../LoginPage'));
export const LazyAuthCallbackPage = lazy(() => import('../AuthCallbackPage'));
export const LazyOnboardingPage = lazy(() => import('../OnboardingPage'));
export const LazyNotFound = lazy(() => import('../NotFound'));

// Dashboard and tracking
export const LazyDashboardPage = lazy(() => import('../DashboardPage'));
export const LazySubTrackerPage = lazy(() => import('../SubTrackerPage'));
export const LazyTributeTrackerPage = lazy(() => import('../TributeTrackerPage'));
export const LazyChecklistPage = lazy(() => import('./LazyChecklistPage'));
export const LazyCalendarPage = lazy(() => import('./LazyCalendarPage'));

// AI and generators
export const LazyChatAssistantPage = lazy(() => import('../ChatAssistantPage'));
export const LazyCaptionGeneratorPage = lazy(() => import('../CaptionGeneratorPage'));
export const LazyTaskGeneratorPage = lazy(() => import('../TaskGeneratorPage'));
export const LazyTwitterGeneratorPage = lazy(() => import('../TwitterGeneratorPage'));
export const LazyRedditGeneratorPage = lazy(() => import('../RedditGeneratorPage'));
export const LazyResponseTemplatesPage = lazy(() => import('../ResponseTemplatesPage'));
export const LazyImageVisionPage = lazy(() => import('../ImageVisionPage'));

// Settings and pricing
export const LazyPricingPage = lazy(() => import('../PricingPage'));
export const LazySettingsPage = lazy(() => import('../SettingsPage'));