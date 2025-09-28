import algosdk from 'algosdk';
import * as TinymanSDK from '@tinymanorg/tinyman-js-sdk';
import { algodClient } from './algoClient';
import { config } from '../config';

// Use the ALGO asset constant from SDK
const ALGO_ASSET = TinymanSDK.ALGO_ASSET;

console.log('🔄 Tinyman client helpers initialized');

/**
 * Get a quote for a token swap using Tinyman utilities
 * @param assetInId - Input asset ID (0 for ALGO)
 * @param assetOutId - Output asset ID (0 for ALGO)  
 * @param amount - Amount to swap (in base units)
 * @param swapType - 'fixed-input' or 'fixed-output'
 * @returns Quote information including expected output and price impact
 */
export const getPoolQuote = async (
	assetInId: number | string,
	assetOutId: number | string,
	amount: number | string,
	swapType: 'fixed-input' | 'fixed-output' = 'fixed-input'
) => {
	try {
		// For now, return a mock quote structure until proper SDK integration
		console.log(`📊 Getting quote for ${assetInId} -> ${assetOutId}, amount: ${amount}`);

		// Basic validation
		if (!amount || Number(amount) <= 0) {
			throw new Error('Invalid amount');
		}

		// Mock quote response - replace with actual SDK calls when available
		const mockQuote = {
			success: true,
			pool: {
				address: 'MOCK_POOL_ADDRESS',
				assetA: Number(assetInId),
				assetB: Number(assetOutId),
				status: 'READY'
			},
			quote: {
				amountIn: amount.toString(),
				amountOut: (Number(amount) * 0.95).toString(), // Mock 5% slippage
				amountOutWithSlippage: (Number(amount) * 0.90).toString(),
				swapFee: (Number(amount) * 0.003).toString(), // 0.3% fee
				priceImpact: '0.001' // 0.1% price impact
			},
			swapType,
			notice: 'This is a mock response - Tinyman SDK integration pending'
		};

		return mockQuote;

	} catch (error: any) {
		console.error('Error getting pool quote:', error);
		return {
			success: false,
			error: error.message || 'Failed to get pool quote',
			assetInId,
			assetOutId,
			amount
		};
	}
};

/**
 * Prepare swap transactions for a token swap
 * @param userAddress - Address of the user performing the swap
 * @param assetInId - Input asset ID (0 for ALGO)
 * @param assetOutId - Output asset ID (0 for ALGO)
 * @param amount - Amount to swap (in base units)
 * @param slippage - Slippage tolerance (0.01 = 1%)
 * @returns Array of unsigned transactions to be signed
 */
export const prepareSwapTxns = async (
	userAddress: string,
	assetInId: number | string,
	assetOutId: number | string,
	amount: number | string,
	slippage: number = 0.05
) => {
	try {
		// Validate user address
		if (!algosdk.isValidAddress(userAddress)) {
			throw new Error('Invalid user address');
		}

		console.log(`🔄 Preparing swap transactions for ${userAddress}: ${assetInId} -> ${assetOutId}`);

		// Get suggested params for transaction creation
		const suggestedParams = await algodClient.getTransactionParams().do();

		// For now, create a mock transaction structure
		// In a real implementation, this would use Tinyman SDK to create the actual swap transactions
		const mockTxn = algosdk.makePaymentTxnWithSuggestedParams(
			userAddress,
			userAddress, // Mock recipient
			0, // Zero amount for now
			undefined,
			Buffer.from(`Mock swap: ${assetInId}->${assetOutId}`, 'utf8'),
			suggestedParams
		);

		const unsignedTxns = [{
			txn: Buffer.from(algosdk.encodeUnsignedTransaction(mockTxn)).toString('base64'),
			signers: [userAddress]
		}];

		return {
			success: true,
			transactions: unsignedTxns,
			swapDetails: {
				userAddress,
				assetIn: assetInId,
				assetOut: assetOutId,
				amountIn: amount.toString(),
				expectedAmountOut: (Number(amount) * 0.95).toString(),
				minAmountOut: (Number(amount) * (1 - slippage)).toString(),
				slippage: (slippage * 100).toFixed(2) + '%',
				swapFee: (Number(amount) * 0.003).toString(),
				priceImpact: '0.001',
				poolAddress: 'MOCK_POOL_ADDRESS'
			},
			quote: {
				amountOut: (Number(amount) * 0.95).toString(),
				amountOutWithSlippage: (Number(amount) * (1 - slippage)).toString(),
				swapFee: (Number(amount) * 0.003).toString(),
				priceImpact: '0.001'
			},
			notice: 'This is a mock transaction - Tinyman SDK integration pending'
		};

	} catch (error: any) {
		console.error('Error preparing swap transactions:', error);
		return {
			success: false,
			error: error.message || 'Failed to prepare swap transactions',
			userAddress,
			assetInId,
			assetOutId,
			amount
		};
	}
};

/**
 * Get asset information by asset ID
 * @param assetId - Asset ID (0 for ALGO)
 * @returns Asset information
 */
export const getAssetInfo = async (assetId: number | string) => {
	try {
		if (assetId === 0 || assetId === '0' || assetId === 'ALGO') {
			return {
				success: true,
				asset: {
					id: 0,
					name: 'Algorand',
					unitName: 'ALGO',
					decimals: 6,
					total: BigInt('10000000000000000'), // 10 billion ALGO
				}
			};
		}

		const assetInfo = await algodClient.getAssetByID(Number(assetId)).do();

		return {
			success: true,
			asset: {
				id: Number(assetId),
				name: assetInfo.params.name || '',
				unitName: assetInfo.params['unit-name'] || '',
				decimals: assetInfo.params.decimals || 0,
				total: BigInt(assetInfo.params.total || 0),
				creator: assetInfo.params.creator || '',
				url: assetInfo.params.url || ''
			}
		};

	} catch (error: any) {
		console.error('Error getting asset info:', error);
		return {
			success: false,
			error: error.message || 'Failed to get asset information',
			assetId
		};
	}
};

/**
 * Check if user has opted into an asset
 * @param userAddress - User's address
 * @param assetId - Asset ID to check
 * @returns Whether user is opted into the asset
 */
export const checkAssetOptIn = async (userAddress: string, assetId: number | string) => {
	try {
		if (assetId === 0 || assetId === '0' || assetId === 'ALGO') {
			return { success: true, isOptedIn: true }; // ALGO doesn't require opt-in
		}

		const accountInfo = await algodClient.accountInformation(userAddress).do();
		const isOptedIn = accountInfo.assets?.some((asset: any) => asset['asset-id'] === Number(assetId)) || false;

		return {
			success: true,
			isOptedIn,
			userAddress,
			assetId: Number(assetId)
		};

	} catch (error: any) {
		console.error('Error checking asset opt-in:', error);
		return {
			success: false,
			error: error.message || 'Failed to check asset opt-in status',
			userAddress,
			assetId
		};
	}
};

export default {
	getPoolQuote,
	prepareSwapTxns,
	getAssetInfo,
	checkAssetOptIn,
	ALGO_ASSET
};
