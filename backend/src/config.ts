import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
	// Algorand network configuration
	ALGOD_API: process.env.ALGOD_API || '',
	INDEXER_API: process.env.INDEXER_API || '',

	// Authentication
	JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',

	// Tinyman DEX configuration
	TINYMAN_FACTORY_ID: process.env.TINYMAN_FACTORY_ID || '',

	// LocalAI configuration
	LOCALAI_URL: process.env.LOCALAI_URL || 'http://localhost:8080',
	MODEL_NAME: process.env.MODEL_NAME || 'gpt-3.5-turbo',

	// Server configuration
	PORT: process.env.PORT || 4000,

	// Google Gemini AI configuration
	GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
	GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
} as const;

// Validate required environment variables
const requiredEnvVars = [
	'ALGOD_API',
	'INDEXER_API',
	'JWT_SECRET',
	'TINYMAN_FACTORY_ID'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
	console.warn(`⚠️  Missing environment variables: ${missingEnvVars.join(', ')}`);
	console.warn('⚠️  Please check your .env file');
}

export default config;
