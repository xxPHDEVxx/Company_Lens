// Environment configuration
export const config = {
  // Set to true to use mock API for testing
  // Set to false to use real backend API
  USE_MOCK_API: false,
  
  // API base URL
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  
  // Feature flags
  features: {
    enableAuth: false, // Set to true when authentication is ready
    enableSearch: true,
    enableGroups: true,
    enableAnalytics: true,
  },
};