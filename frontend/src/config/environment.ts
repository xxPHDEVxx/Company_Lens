// Environment configuration
export const config = {
  // API base URL
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  
  // Feature flags
  features: {
    enableAuth: true, // Authentication is ready
    enableSearch: true,
    enableGroups: true,
    enableAnalytics: true,
  },
};