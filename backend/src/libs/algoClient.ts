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

// Get connected wallet address (helper function for wallet integration)
export const getConnectedWallet = (): string | null => {
	// This would typically get the wallet address from the current session/context
	// For now, returning null - this should be implemented based on your auth system
	return null;
};

// Helper function to get last N transactions for a wallet
export const getLastTransactions = async (walletAddress: string, count: number = 10) => {
	try {
		if (!algosdk.isValidAddress(walletAddress)) {
			throw new Error('Invalid wallet address');
		}

		// Query transactions from the indexer
		const response = await indexerClient
			.lookupAccountTransactions(walletAddress)
			.limit(count)
			.do();

		const transactions = response.transactions || [];

		// Parse and format transactions
		const formattedTransactions = transactions.map((txn: any) => {
			const txType = txn['tx-type'];
			const sender = txn.sender;
			const receiver = txn['payment-transaction']?.receiver || '';
			const amount = txn['payment-transaction']?.amount || 0;
			const fee = txn.fee || 0;
			const timestamp = new Date(txn['round-time'] * 1000);
			const txId = txn.id;
			const round = txn['confirmed-round'];

			// Determine transaction direction
			const isOutgoing = sender === walletAddress;
			const counterparty = isOutgoing ? receiver : sender;

			// Format amount in ALGO (convert from microALGO)
			const amountInAlgo = amount / 1000000;

			return {
				txId,
				type: txType,
				direction: isOutgoing ? 'sent' : 'received',
				counterparty,
				amount: amountInAlgo,
				fee: fee / 1000000, // Convert fee to ALGO
				timestamp,
				round,
				raw: txn // Keep raw transaction for additional processing
			};
		});

		return {
			success: true,
			transactions: formattedTransactions,
			count: formattedTransactions.length
		};

	} catch (error) {
		console.error('Error fetching transactions:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
			transactions: [],
			count: 0
		};
	}
};

// Helper function to summarize transactions in human-readable format
export const summarizeTransactions = (transactions: any[], walletAddress: string): string => {
	if (!transactions || transactions.length === 0) {
		return 'No transactions found for this wallet.';
	}

	const summaries = transactions.map((txn, index) => {
		const { direction, counterparty, amount, timestamp, type } = txn;
		const date = timestamp.toISOString().split('T')[0]; // Format: YYYY-MM-DD
		const shortAddress = `${counterparty.slice(0, 6)}...${counterparty.slice(-4)}`;

		if (type === 'pay') {
			if (direction === 'sent') {
				return `${index + 1}. Sent ${amount.toFixed(6)} ALGO to ${shortAddress} on ${date}`;
			} else {
				return `${index + 1}. Received ${amount.toFixed(6)} ALGO from ${shortAddress} on ${date}`;
			}
		} else {
			return `${index + 1}. ${type} transaction with ${shortAddress} on ${date}`;
		}
	});

	return summaries.join('\n');
};

// Helper function to get account balance and assets
export const getAccountBalance = async (walletAddress: string) => {
	try {
		if (!algosdk.isValidAddress(walletAddress)) {
			throw new Error('Invalid wallet address');
		}

		// Query account information from indexer
		const accountInfo = await indexerClient.lookupAccountByID(walletAddress).do();

		if (!accountInfo.account) {
			throw new Error('Account not found');
		}

		const account = accountInfo.account;

		// Get ALGO balance (convert from microALGO)
		const algoBalance = account.amount / 1000000;
		const minBalance = account['min-balance'] / 1000000;
		const availableBalance = algoBalance - minBalance;

		// Get ASA (Algorand Standard Assets) balances
		const assets = account.assets || [];
		const assetBalances = [];

		for (const asset of assets) {
			try {
				// Get asset information
				const assetInfo = await indexerClient.lookupAssetByID(asset['asset-id']).do();
				const assetParams = assetInfo.asset.params;

				const decimals = assetParams.decimals || 0;
				const unitName = assetParams['unit-name'] || 'Unknown';
				const name = assetParams.name || 'Unknown Asset';
				const balance = asset.amount / Math.pow(10, decimals);

				if (balance > 0) {
					assetBalances.push({
						assetId: asset['asset-id'],
						unitName,
						name,
						balance,
						decimals
					});
				}
			} catch (assetError) {
				console.warn(`Could not fetch info for asset ${asset['asset-id']}:`, assetError);
			}
		}

		return {
			success: true,
			address: walletAddress,
			algoBalance,
			availableBalance,
			minBalance,
			assets: assetBalances,
			totalAssets: assets.length
		};

	} catch (error) {
		console.error('Error fetching account balance:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
			address: walletAddress,
			algoBalance: 0,
			availableBalance: 0,
			minBalance: 0,
			assets: [],
			totalAssets: 0
		};
	}
};

export default {
	algodClient,
	indexerClient,
	checkAlgorandConnection,
	checkIndexerConnection,
	getConnectedWallet,
	getLastTransactions,
	summarizeTransactions,
	getAccountBalance
};
