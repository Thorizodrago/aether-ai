import algosdk from 'algosdk';
import { config } from '../config';

// Initialize Algod client for interacting with the Algorand network
export const algodClient = new algosdk.Algodv2('', config.ALGOD_API, '');

// Initialize Indexer client for querying blockchain data
export const indexerClient = new algosdk.Indexer('', config.INDEXER_API, '');

// Helper function to check client connections
export const checkAlgorandConnection = async () => {
	try {
		const status = await algodClient.status().do();
		const health = await algodClient.healthCheck().do();

		console.log('✅ Algorand connection established');
		console.log(`📊 Network: ${status.network || 'Unknown'}`);
		console.log(`🔗 Current round: ${status['last-round']}`);

		return { connected: true, status, health };
	} catch (error) {
		console.error('❌ Failed to connect to Algorand network:', error);
		return { connected: false, error };
	}
};

// Helper function to check indexer connection
export const checkIndexerConnection = async () => {
	try {
		const health = await indexerClient.makeHealthCheck().do();
		console.log('✅ Algorand Indexer connection established');
		return { connected: true, health };
	} catch (error) {
		console.error('❌ Failed to connect to Algorand Indexer:', error);
		return { connected: false, error };
	}
};

export default {
	algodClient,
	indexerClient,
	checkAlgorandConnection,
	checkIndexerConnection
};
