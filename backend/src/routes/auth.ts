import express from 'express';
import { requestChallenge, verifySignedTransaction } from '../controllers/authController';

const router = express.Router();

// POST /auth/request-challenge
// Body: { address: string }
// Returns: { challenge: string, expiry: number, message: string }
router.post('/request-challenge', requestChallenge);

// POST /auth/verify-signed-tx
// Body: { signedTxnB64: string }
// Returns: { success: boolean, token: string, address: string, message: string }
router.post('/verify-signed-tx', verifySignedTransaction);

export default router;
