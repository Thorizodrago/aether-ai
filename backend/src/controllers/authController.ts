import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import algosdk from 'algosdk';
import { config } from '../config';

// In-memory storage for challenges (use Redis in production)
interface Challenge {
	challenge: string;
	address: string;
	expiry: number;
}

const challenges = new Map<string, Challenge>();

// Clean up expired challenges every minute
setInterval(() => {
	const now = Date.now();
	for (const [key, value] of challenges.entries()) {
		if (value.expiry < now) {
			challenges.delete(key);
		}
	}
}, 60000);

export const requestChallenge = async (req: Request, res: Response): Promise<Response | void> => {
	try {
		const { address } = req.body;

		if (!address) {
			return res.status(400).json({ error: 'Address is required' });
		}

		// Validate Algorand address format
		if (!algosdk.isValidAddress(address)) {
			return res.status(400).json({ error: 'Invalid Algorand address' });
		}

		// Generate random challenge
		const challenge = crypto.randomBytes(32).toString('hex');
		const expiry = Date.now() + 2 * 60 * 1000; // 2 minutes from now

		// Store challenge
		challenges.set(address, {
			challenge,
			address,
			expiry
		});

		console.log(`🔐 Generated challenge for address: ${address}`);

		res.json({
			challenge,
			expiry,
			message: 'Sign a transaction with amount=0 and this challenge in the note field'
		});
	} catch (error) {
		console.error('Error generating challenge:', error);
		res.status(500).json({ error: 'Failed to generate challenge' });
	}
};

export const verifySignedTransaction = async (req: Request, res: Response): Promise<Response | void> => {
	try {
		const { signedTxnB64 } = req.body;

		if (!signedTxnB64) {
			return res.status(400).json({ error: 'Signed transaction is required' });
		}

		// Decode the signed transaction
		let decodedTxn;
		try {
			const signedTxnBuffer = Buffer.from(signedTxnB64, 'base64');
			decodedTxn = algosdk.decodeSignedTransaction(signedTxnBuffer);
		} catch (error) {
			return res.status(400).json({ error: 'Invalid signed transaction format' });
		}

		const txn = decodedTxn.txn;
		const fromAddress = algosdk.encodeAddress(txn.from.publicKey);

		// Verify transaction amount is 0
		if (txn.amount && txn.amount > 0) {
			return res.status(400).json({ error: 'Transaction amount must be 0' });
		}

		// Extract and verify the note (challenge)
		if (!txn.note) {
			return res.status(400).json({ error: 'Transaction must include a note with the challenge' });
		}

		const noteString = Buffer.from(txn.note).toString('utf8');

		// Check if we have a challenge for this address
		const storedChallenge = challenges.get(fromAddress);
		if (!storedChallenge) {
			return res.status(400).json({ error: 'No challenge found for this address' });
		}

		// Verify the challenge matches
		if (storedChallenge.challenge !== noteString) {
			return res.status(400).json({ error: 'Invalid challenge in transaction note' });
		}

		// Check if challenge has expired
		if (storedChallenge.expiry < Date.now()) {
			challenges.delete(fromAddress);
			return res.status(400).json({ error: 'Challenge has expired' });
		}

		// Remove used challenge
		challenges.delete(fromAddress);

		// Generate JWT token
		const token = jwt.sign(
			{
				address: fromAddress,
				iat: Math.floor(Date.now() / 1000),
				exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
			},
			config.JWT_SECRET
		);

		console.log(`✅ Authentication successful for address: ${fromAddress}`);

		res.json({
			success: true,
			token,
			address: fromAddress,
			message: 'Authentication successful'
		});

	} catch (error) {
		console.error('Error verifying signed transaction:', error);
		res.status(500).json({ error: 'Failed to verify signed transaction' });
	}
};

// Middleware to verify JWT tokens
export const verifyToken = (req: Request, res: Response, next: NextFunction): Response | void => {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return res.status(401).json({ error: 'No token provided' });
		}

		const token = authHeader.substring(7); // Remove 'Bearer ' prefix

		const decoded = jwt.verify(token, config.JWT_SECRET) as any;
		(req as any).user = decoded;
		next();
	} catch (error) {
		console.error('Token verification failed:', error);
		res.status(401).json({ error: 'Invalid token' });
	}
};
