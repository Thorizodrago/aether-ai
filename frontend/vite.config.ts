import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');

	return {
		plugins: [
			react(),
			nodePolyfills({
				// To exclude specific polyfills, add them to this list.
				exclude: [],
				// Whether to polyfill `global`.
				globals: {
					Buffer: true, // can also be 'build', 'dev', or false
					global: true,
					process: true,
				},
				// Whether to polyfill specific globals.
				protocolImports: true,
			})
		],
		define: {
			global: 'globalThis',
		},
		optimizeDeps: {
			include: ['buffer', 'process', 'stream', 'crypto-browserify']
		},
		server: {
			port: 3000,
			host: true,
			proxy: {
				'/auth': {
					target: env.VITE_API_URL || 'http://localhost:4000',
					changeOrigin: true,
					secure: false,
				},
				'/tx': {
					target: env.VITE_API_URL || 'http://localhost:4000',
					changeOrigin: true,
					secure: false,
				},
				'/api': {
					target: env.VITE_API_URL || 'http://localhost:4000',
					changeOrigin: true,
					secure: false,
				},
			},
		},
		build: {
			outDir: 'dist',
			sourcemap: true,
		},
	}
})
