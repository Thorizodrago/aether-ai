import { Request, Response } from 'express';
import algosdk from 'algosdk';
import { algodClient } from '../libs/algoClient';
import { prepareSwapTxns, getPoolQuote } from '../libs/tinymanClient';
import { config } from '../config';

// Extend Request type to include user from JWT
interface AuthenticatedRequest extends Request {
	user: {
		address: string;
		iat: number;
		exp: number;
	};
}

export const preparePayment = async (req: Request, res: Response): Promise<Response | void> => {
	try {
		const { to, amount } = req.body;
		const userAddress = (req as AuthenticatedRequest).user.address;

		// Validate inputs
		if (!to) {
			return res.status(400).json({ error: 'Recipient address (to) is required' });
		}

		if (!amount || amount <= 0) {
			return res.status(400).json({ error: 'Amount must be greater than 0' });
		}

		if (!algosdk.isValidAddress(to)) {
			return res.status(400).json({ error: 'Invalid recipient address' });
		}

		// Get suggested params
		const suggestedParams = await algodClient.getTransactionParams().do();

		// Create payment transaction
		const paymentTxn = algosdk.makePaymentTxnWithSuggestedParams(
			userAddress,
			to,
			amount,
			undefined, // closeRemainderTo
			undefined, // note
			suggestedParams
		);

		// Encode to base64
		const unsignedB64 = Buffer.from(algosdk.encodeUnsignedTransaction(paymentTxn)).toString('base64');

		console.log(`💰 Prepared payment: ${userAddress} -> ${to}, amount: ${amount}`);

		res.json({
			success: true,
			unsignedB64,
			txnDetails: {
				from: userAddress,
				to,
				amount,
				fee: paymentTxn.fee,
				firstRound: paymentTxn.firstRound,
				lastRound: paymentTxn.lastRound,
				genesisHash: paymentTxn.genesisHash
			}
		});

	} catch (error) {
		console.error('Error preparing payment:', error);
		res.status(500).json({ error: 'Failed to prepare payment transaction' });
	}
};

export const broadcastTransaction = async (req: Request, res: Response): Promise<Response | void> => {
	try {
		const { signedTxnB64 } = req.body;
		const userAddress = (req as AuthenticatedRequest).user.address;

		if (!signedTxnB64) {
			return res.status(400).json({ error: 'Signed transaction is required' });
		}

		// Decode signed transaction
		let signedTxn;
		try {
			const signedTxnBuffer = Buffer.from(signedTxnB64, 'base64');
			signedTxn = algosdk.decodeSignedTransaction(signedTxnBuffer);
		} catch (error) {
			return res.status(400).json({ error: 'Invalid signed transaction format' });
		}

		// Verify the transaction is from the authenticated user
		const fromAddress = algosdk.encodeAddress(signedTxn.txn.from.publicKey);
		if (fromAddress !== userAddress) {
			return res.status(403).json({ error: 'Transaction sender does not match authenticated user' });
		}

		// Broadcast transaction
		const txnResult = await algodClient.sendRawTransaction(Buffer.from(signedTxnB64, 'base64')).do();

		console.log(`📡 Transaction broadcast successful: ${txnResult.txId}`);

		res.json({
			success: true,
			txId: txnResult.txId,
			message: 'Transaction broadcast successful'
		});

	} catch (error: any) {
		console.error('Error broadcasting transaction:', error);

		// Handle specific Algorand errors
		if (error?.response?.body?.message) {
			return res.status(400).json({
				error: 'Transaction rejected by network',
				details: error.response.body.message
			});
		}

		res.status(500).json({ error: 'Failed to broadcast transaction' });
	}
};

export const prepareSwap = async (req: Request, res: Response): Promise<Response | void> => {
	try {
		const { fromAsset, toAsset, amount } = req.body;
		const userAddress = (req as AuthenticatedRequest).user.address;

		// Validate inputs
		if (!fromAsset || !toAsset || !amount) {
			return res.status(400).json({ error: 'fromAsset, toAsset, and amount are required' });
		}

		if (amount <= 0) {
			return res.status(400).json({ error: 'Amount must be greater than 0' });
		}

		console.log(`🔄 Preparing swap: ${amount} ${fromAsset} -> ${toAsset} for ${userAddress}`);

		// Use the Tinyman client to prepare swap transactions
		const swapResult = await prepareSwapTxns(
			userAddress,
			fromAsset,
			toAsset,
			amount,
			0.05 // 5% slippage tolerance
		);

		if (!swapResult.success) {
			return res.status(400).json({
				error: swapResult.error,
				details: 'Failed to prepare swap transactions'
			});
		}

		res.json({
			success: true,
			unsignedB64: swapResult.transactions?.map(tx => tx.txn) || [], // Extract transaction base64
			swapDetails: swapResult.swapDetails,
			quote: swapResult.quote,
			message: swapResult.notice || 'Sign all transactions in the correct order'
		});

	} catch (error: any) {
		console.error('Error preparing swap:', error);
		res.status(500).json({ error: 'Failed to prepare swap transaction' });
	}
};
