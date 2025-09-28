import express from 'express';
import cors from 'cors';
import { config } from './config';
import { checkAlgorandConnection, checkIndexerConnection } from './libs/algoClient';
import authRoutes from './routes/auth';
import txRoutes from './routes/tx';
import { generateAlgorandResponse } from './geminiClient';
import WalletService from './services/walletService';

const app = express();

// Middleware
app.use(cors({
	origin: [
		'http://localhost:3000',
		'http://localhost:3001',
		'http://localhost:3002',
		'http://localhost:5173',
		process.env.FRONTEND_URL || 'http://localhost:3002'
	],
	methods: ['GET', 'POST', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization'],
	credentials: true
}));
app.use(express.json());

// Mount routes
app.use('/auth', authRoutes);
app.use('/tx', txRoutes);

// Gemini AI endpoint
app.post('/ai/ask', async (req, res) => {
	try {
		const { question, walletAddress } = req.body;

		if (!question || typeof question !== 'string') {
			return res.status(400).json({
				error: 'Question is required and must be a string'
			});
		}

		console.log(`🤖 AI Request from wallet: ${walletAddress || 'anonymous'}`);
		console.log(`📝 Question: ${question}`);

		// Check if this is a wallet-related query
		let enhancedQuestion = question;
		let walletContext = '';

		if (walletAddress && WalletService.isWalletCommand(question)) {
			console.log('🔍 Detected wallet-related query, fetching transaction data...');

			const transactionCount = WalletService.extractTransactionCount(question);
			const walletData = await WalletService.getTransactionsForAI(walletAddress, transactionCount);

			if (walletData.success && walletData.summary) {
				walletContext = `\n\nWallet Context for ${walletAddress}:\n${walletData.summary}`;
				enhancedQuestion = question + walletContext;
				console.log('✅ Enhanced question with wallet transaction context');
			} else if (walletData.error) {
				console.log(`⚠️ Could not fetch wallet data: ${walletData.error}`);
				walletContext = `\n\nNote: Unable to fetch recent transactions for wallet analysis.`;
				enhancedQuestion = question + walletContext;
			}
		}

		console.log('🤖 Generating AI response for Algorand question...');
		const response = await generateAlgorandResponse(enhancedQuestion);
		console.log('✅ AI response generated successfully');

		return res.json({
			response,
			timestamp: new Date().toISOString(),
			walletContext: walletContext ? 'Transaction data included' : 'No wallet context'
		});

	} catch (error) {
		console.error('AI Endpoint Error:', error);
		return res.status(500).json({
			error: 'Failed to generate AI response',
			details: error instanceof Error ? error.message : 'Unknown error'
		});
	}
});

// Dedicated wallet transaction summary endpoint
app.post('/wallet/transactions/summary', async (req, res) => {
	try {
		const { walletAddress, count = 5 } = req.body;

		if (!walletAddress) {
			return res.status(400).json({
				error: 'Wallet address is required'
			});
		}

		console.log(`📊 Wallet transaction summary request for: ${walletAddress}`);
		console.log(`📝 Requesting last ${count} transactions`);

		const summary = await WalletService.summarizeLastTransactions(walletAddress, count);

		if (!summary.success) {
			return res.status(400).json({
				error: summary.error,
				summary: summary.summary
			});
		}

		return res.json({
			success: true,
			walletAddress: summary.walletAddress,
			transactionCount: summary.transactionCount,
			summary: summary.summary,
			timestamp: new Date().toISOString()
		});

	} catch (error) {
		console.error('Wallet Summary Endpoint Error:', error);
		return res.status(500).json({
			error: 'Failed to generate wallet transaction summary',
			details: error instanceof Error ? error.message : 'Unknown error'
		});
	}
});

// Root route
app.get('/', (req, res) => {
	res.json({
		message: 'Welcome to Aether AI API',
		version: '1.0.0',
		status: 'running',
		endpoints: {
			health: '/health',
			ai: '/ai/ask',
			auth: '/auth/*',
			transactions: '/tx/*'
		}
	});
});

app.get('/health', (req, res) => {
	res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
	console.error(err.stack);
	res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
	res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(config.PORT, async () => {
	console.log(`🚀 Aether AI Backend server is running on port ${config.PORT}`);
	console.log(`📍 Health check available at http://localhost:${config.PORT}/health`);

	// Check Algorand connections
	await checkAlgorandConnection();
	await checkIndexerConnection();
});

export default app;
