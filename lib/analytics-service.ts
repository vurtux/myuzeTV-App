// This base file handles platform routing for AnalyticsService.
// Metro/Expo will prioritize .web.ts for Web and .native.ts for Mobile.
// We export a dummy to satisfy the base import if needed.

export const analyticsService = {
  init: async () => console.log("[Analytics] Base Service Placeholder"),
  identify: async () => {},
  trackEvent: async () => {},
  screenView: async () => {},
  reset: async () => {}
} as any;
