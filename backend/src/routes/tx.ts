import express from 'express';
import { verifyToken } from '../controllers/authController';
import { preparePayment, broadcastTransaction, prepareSwap } from '../controllers/txnController';
import { getPoolQuote, getAssetInfo, checkAssetOptIn } from '../libs/tinymanClient';

const router = express.Router();

// All transaction routes require authentication
router.use(verifyToken);

// POST /tx/prepare-payment
// Body: { to: string, amount: number }
// Returns: { success: boolean, unsignedB64: string, txnDetails: object }
router.post('/prepare-payment', preparePayment);

// POST /tx/broadcast
// Body: { signedTxnB64: string }
// Returns: { success: boolean, txId: string, message: string }
router.post('/broadcast', broadcastTransaction);

// POST /tx/prepare-swap
// Body: { fromAsset: string|number, toAsset: string|number, amount: number }
// Returns: { success: boolean, unsignedB64: string[], swapDetails: object }
router.post('/prepare-swap', prepareSwap);

// GET /tx/quote/:fromAsset/:toAsset/:amount
// Get swap quote without preparing transactions
router.get('/quote/:fromAsset/:toAsset/:amount', async (req, res) => {
	try {
		const { fromAsset, toAsset, amount } = req.params;
		const quote = await getPoolQuote(fromAsset, toAsset, amount);
		res.json(quote);
	} catch (error) {
		res.status(500).json({ error: 'Failed to get quote' });
	}
});

// GET /tx/asset/:assetId
// Get asset information
router.get('/asset/:assetId', async (req, res) => {
	try {
		const { assetId } = req.params;
		const assetInfo = await getAssetInfo(assetId);
		res.json(assetInfo);
	} catch (error) {
		res.status(500).json({ error: 'Failed to get asset info' });
	}
});

// GET /tx/opt-in-status/:assetId
// Check if authenticated user is opted into an asset
router.get('/opt-in-status/:assetId', async (req, res) => {
	try {
		const { assetId } = req.params;
		const userAddress = (req as any).user.address;
		const optInStatus = await checkAssetOptIn(userAddress, assetId);
		res.json(optInStatus);
	} catch (error) {
		res.status(500).json({ error: 'Failed to check opt-in status' });
	}
});

export default router;
