// Test script to verify configuration
import { config, getApiUrl } from './src/config.js';

console.log('🔧 Configuration Test');
console.log('====================');
console.log('Environment:', import.meta.env.MODE);
console.log('Backend URL:', config.backendUrl);
console.log('Dev Port:', config.devPort);
console.log('App Title:', config.appTitle);
console.log('');

console.log('🌐 API URL Tests');
console.log('================');
console.log('Process endpoint:', getApiUrl('process'));
console.log('Static endpoint:', getApiUrl('static'));
console.log('Media endpoint:', getApiUrl('media'));
console.log('');

console.log('📋 Available endpoints:');
Object.entries(config.apiEndpoints).forEach(([key, value]) => {
  console.log(`  ${key}: ${value}`);
});

console.log('');
console.log('✅ Configuration test completed!');
