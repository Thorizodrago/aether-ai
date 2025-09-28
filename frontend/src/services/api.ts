/*
 * API Service Configuration - TestNet Setup Complete
 * 
 * Centralized axios instance for all frontend API calls.
 * Configured to work with TestNet backend endpoints.
 * 
 * Developer Setup Summary:
 * ✅ Environment variables configured for TestNet
 * ✅ Pera Wallet configured with TestNet chainId (416002)  
 * ✅ Backend proxy routes configured in vite.config.ts
 * ✅ Browser polyfills added to main.tsx
 * 
 * Next Steps:
 * 1. Install @perawallet/connect: npm install @perawallet/connect
 * 2. Install required polyfills: npm install buffer process stream crypto-browserify
 * 3. Start backend: npm run dev in backend/ (should run on port 4000)
 * 4. Test backend: visit http://localhost:4000/auth/request-challenge
 * 5. Switch Pera Wallet mobile to TestNet (Settings > Developer Settings > Network)
 * 
 * Troubleshooting:
 * - If network errors persist, confirm mobile Pera is in TestNet mode
 * - Verify VITE_API_URL points to running backend (default: http://localhost:4000)
 * - Check browser console for CORS or connection errors
 */

import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
	withCredentials: true,
	headers: {
		'Content-Type': 'application/json',
	},
});

// Request interceptor for debugging
api.interceptors.request.use(
	(config) => {
		console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
		return config;
	},
	(error) => {
		console.error('API Request Error:', error);
		return Promise.reject(error);
	}
);

// Response interceptor for debugging
api.interceptors.response.use(
	(response) => {
		console.log(`✅ API Response: ${response.status} ${response.config.url}`);
		return response;
	},
	(error) => {
		console.error('API Response Error:', error.response?.status, error.response?.data);
		return Promise.reject(error);
	}
);

export default api;
