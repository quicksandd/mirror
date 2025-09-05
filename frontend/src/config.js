// Environment configuration
export const config = {
  // Backend API URL - defaults to localhost:8000 if not set
  backendUrl: import.meta.env.VITE_BACKEND_URL === '/' ? '' : (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'),
  
  // Development server port
  devPort: import.meta.env.VITE_DEV_SERVER_PORT || 3000,
  
  // App title
  appTitle: import.meta.env.VITE_APP_TITLE || 'Mirror Analysis UI',
  
  // GitHub repository URL
  githubUrl: import.meta.env.VITE_GITHUB_URL || 'https://github.com/quicksandd/mirror',
  
  // API endpoints
  apiEndpoints: {
    process: '/mirror/api/process/',
    insights: '/mirror/api/insights/',
    static: '/static',
    media: '/media'
  },
  
  // UI assets base path
  uiAssetsPath: import.meta.env.DEV ? '/ui' : '/static/ui'
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  const apiPath = config.apiEndpoints[endpoint] || endpoint;
  
  // If endpoint already has full URL, return as is
  if (apiPath.startsWith('http')) {
    return apiPath;
  }
  
  // In development, use relative URLs to leverage Vite proxy
  if (import.meta.env.DEV) {
    return apiPath;
  }
  
  // In production, construct full URL
  const baseUrl = config.backendUrl;
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanApiPath = apiPath.startsWith('/') ? apiPath : `/${apiPath}`;
  
  return `${cleanBaseUrl}${cleanApiPath}`;
};

// Helper function to get UI asset URL
export const getUiAssetUrl = (assetPath) => {
  // Remove leading slash if present
  const cleanPath = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
  return `${config.uiAssetsPath}/${cleanPath}`;
};
