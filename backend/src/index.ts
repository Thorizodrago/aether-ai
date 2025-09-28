import express from 'express';
import cors from 'cors';
import { config } from './config';
import { checkAlgorandConnection, checkIndexerConnection } from './libs/algoClient';
import authRoutes from './routes/auth';
import txRoutes from './routes/tx';
import { generateAlgorandResponse } from './geminiClient';

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

		const response = await generateAlgorandResponse(question);

		return res.json({
			response,
			timestamp: new Date().toISOString()
		});

	} catch (error) {
		console.error('AI Endpoint Error:', error);
		return res.status(500).json({
			error: 'Failed to generate AI response',
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
