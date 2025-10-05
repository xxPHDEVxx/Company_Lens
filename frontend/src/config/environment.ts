// Environment configuration
export const config = {
  // API base URL - supports both env var names for compatibility
  API_BASE_URL: import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',

  // Feature flags
  features: {
    enableAuth: true, // Authentication is ready
    enableSearch: true,
    enableGroups: true,
    enableAnalytics: true,
  },
};