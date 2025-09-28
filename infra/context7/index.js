const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8081;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
	res.json({
		service: 'Context7',
		status: 'running',
		version: '1.0.0',
		timestamp: new Date().toISOString()
	});
});

app.get('/health', (req, res) => {
	res.json({
		status: 'healthy',
		timestamp: new Date().toISOString()
	});
});

app.get('/api/context', (req, res) => {
	// Placeholder for context management endpoints
	res.json({
		contexts: [],
		total: 0,
		message: 'Context7 service is ready'
	});
});

// Error handling
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
	res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
	console.log(`🔗 Context7 service running on port ${PORT}`);
	console.log(`📍 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
