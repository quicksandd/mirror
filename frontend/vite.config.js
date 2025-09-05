import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  const backendUrl = env.VITE_BACKEND_URL === '/' ? env.VITE_BACKEND_URL : (env.VITE_BACKEND_URL || (mode === 'production' ? '' : 'http://localhost:8000'))
  
  console.log(`🚀 Vite config loaded with backend URL: ${backendUrl}`)
  
  return {
    plugins: [react()],

    base: process.env.NODE_ENV === 'development' ? '/' : '/static/',
    server: {
      port: parseInt(env.VITE_DEV_SERVER_PORT) || 5173,
      proxy: {
        '/mirror/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          },
        },
        '/mirror/static': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
        '/mirror/media': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        }
      }
    },
    build: {
      outDir: '../static/frontend',
      assetsDir: 'assets',
      emptyOutDir: true,
    },
    define: {
      // Make environment variables available to the client
      __BACKEND_URL__: JSON.stringify(backendUrl)
    }
  }
})