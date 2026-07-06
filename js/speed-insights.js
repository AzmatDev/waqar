/**
 * Vercel Speed Insights Initialization
 * This module loads and initializes Speed Insights for performance tracking
 */

// Import the injectSpeedInsights function from the package
import { injectSpeedInsights } from '../node_modules/@vercel/speed-insights/dist/index.mjs';

// Initialize Speed Insights with configuration
injectSpeedInsights({
  debug: false, // Set to true for debugging in development
  sampleRate: 1 // Track 100% of page views (adjust as needed)
});
