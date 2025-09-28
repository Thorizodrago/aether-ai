import { GoogleGenAI } from "@google/genai";
import { config } from './config';

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });

/**
 * Check if the prompt is related to Algorand/Web3
 * @param prompt - User's input prompt
 * @returns boolean - true if prompt contains Algorand-related keywords
 */
export function isAlgorandRelated(prompt: string): boolean {
	const algorandKeywords = [
		'algorand', 'algo', 'algosdk', 'algokit', 'algoexplorer',
		'web3', 'blockchain', 'wallet', 'pera', 'myalgo', 'defly',
		'smart contract', 'dapp', 'defi', 'nft', 'asa', 'asset',
		'tinyman', 'pool', 'swap', 'liquidity', 'staking',
		'testnet', 'mainnet', 'transaction', 'txn'
	];

	const lowerPrompt = prompt.toLowerCase();
	return algorandKeywords.some(keyword => lowerPrompt.includes(keyword));
}

/**
 * Generate AI response using Google Gemini API
 * @param prompt - User's question about Algorand
 * @returns Promise<string> - AI-generated response
 */
export async function generateAlgorandResponse(prompt: string): Promise<string> {
	try {
		// Check if API key is configured
		if (!config.GEMINI_API_KEY) {
			throw new Error('Gemini API key not configured');
		}

		// Validate that the prompt is Algorand-related
		if (!isAlgorandRelated(prompt)) {
			return "Please ask questions about your Web3 problems (Algorand, wallets, pools, contracts).";
		}

		// Enhanced prompt with Algorand context
		const enhancedPrompt = `
You are Aether AI, a specialized AI assistant for Algorand and Web3 development. 
Please provide a helpful and accurate answer to the following Algorand-related question:

Question: ${prompt}

Guidelines:
- Focus on Algorand blockchain, smart contracts, DeFi, and Web3 development
- Provide practical, actionable advice
- Include code examples when relevant (JavaScript/TypeScript preferred)
- Mention relevant tools like AlgoSDK, AlgoKit, Pera Wallet, etc.
- Keep responses concise but informative
- If you're unsure, suggest official Algorand documentation
    `;

		console.log('🤖 Generating AI response for Algorand question...');

		// Generate content using Gemini - new API structure
		const response = await ai.models.generateContent({
			model: config.GEMINI_MODEL,
			contents: enhancedPrompt
		});

		console.log('✅ AI response generated successfully');
		return response.text || 'I apologize, but I could not generate a response. Please try rephrasing your question.';

	} catch (error) {
		console.error('❌ Gemini API error:', error);

		// Handle specific error types
		if (error instanceof Error) {
			if (error.message.includes('API key')) {
				return 'AI service configuration error. Please contact support.';
			}
			if (error.message.includes('quota') || error.message.includes('rate limit')) {
				return 'AI service is temporarily busy. Please try again in a few moments.';
			}
		}

		return 'AI service unavailable. Please try again later.';
	}
}

/**
 * Health check for Gemini API connection
 * @returns Promise<boolean> - true if API is accessible
 */
export async function checkGeminiHealth(): Promise<boolean> {
	try {
		if (!config.GEMINI_API_KEY) {
			return false;
		}
		// Simple test query using new API
		const response = await ai.models.generateContent({
			model: config.GEMINI_MODEL,
			contents: 'Hello, are you working?'
		});
		return Boolean(response.text);
	} catch (error) {
		console.error('Gemini health check failed:', error);
		return false;
	}
}
