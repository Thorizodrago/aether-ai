# Authentication API Documentation

## Overview
The authentication system uses Algorand wallet signatures to verify user identity. Users sign a zero-amount transaction with a challenge in the note field to prove ownership of their wallet.

## Endpoints

### 1. Request Challenge
**POST** `/auth/request-challenge`

Request a challenge for wallet authentication.

**Request Body:**
```json
{
  "address": "ALGORAND_ADDRESS_HERE"
}
```

**Response:**
```json
{
  "challenge": "64-character-hex-string",
  "expiry": 1693123456789,
  "message": "Sign a transaction with amount=0 and this challenge in the note field"
}
```

**Error Responses:**
- `400` - Invalid or missing address
- `500` - Server error

### 2. Verify Signed Transaction
**POST** `/auth/verify-signed-tx`

Verify a signed transaction containing the challenge and receive a JWT token.

**Request Body:**
```json
{
  "signedTxnB64": "base64-encoded-signed-transaction"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token-here",
  "address": "ALGORAND_ADDRESS_HERE",
  "message": "Authentication successful"
}
```

**Error Responses:**
- `400` - Invalid transaction, wrong amount, missing/invalid challenge, expired challenge
- `500` - Server error

## Authentication Flow

1. **Request Challenge**: Client calls `/auth/request-challenge` with user's Algorand address
2. **Sign Transaction**: User signs a transaction with:
   - Amount: 0 (zero)
   - Recipient: Any valid address (can be same as sender)
   - Note: The challenge string received from step 1
3. **Verify Signature**: Client sends the base64-encoded signed transaction to `/auth/verify-signed-tx`
4. **Receive Token**: Server validates the transaction and returns a JWT token
5. **Use Token**: Include token in Authorization header: `Bearer <token>`

## Security Features

- **Challenge Expiry**: Challenges expire after 2 minutes
- **Zero Amount**: Only zero-amount transactions are accepted
- **Address Validation**: Algorand address format validation
- **JWT Expiry**: Tokens expire after 24 hours
- **One-time Use**: Each challenge can only be used once

## Example Usage

```javascript
// Step 1: Request challenge
const challengeResponse = await fetch('/auth/request-challenge', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ address: 'USER_ALGORAND_ADDRESS' })
});
const { challenge } = await challengeResponse.json();

// Step 2: Create and sign transaction (using AlgoSDK)
const txn = algosdk.makePaymentTxnWithSuggestedParams(
  senderAddress,
  senderAddress, // or any valid recipient
  0, // amount = 0
  undefined, // closeRemainderTo
  new Uint8Array(Buffer.from(challenge, 'utf8')), // note
  suggestedParams
);

const signedTxn = algosdk.signTransaction(txn, secretKey);

// Step 3: Verify signature
const authResponse = await fetch('/auth/verify-signed-tx', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    signedTxnB64: Buffer.from(signedTxn.blob).toString('base64') 
  })
});
const { token } = await authResponse.json();

// Step 4: Use token for authenticated requests
const protectedResponse = await fetch('/protected-endpoint', {
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## JWT Token Structure

The JWT token contains:
```json
{
  "address": "user-algorand-address",
  "iat": 1693123456,  // issued at
  "exp": 1693209856   // expires (24h later)
}
```

## Middleware Usage

To protect routes, use the `verifyToken` middleware:

```typescript
import { verifyToken } from '../controllers/authController';

router.get('/protected-route', verifyToken, (req, res) => {
  // req.user contains decoded JWT payload
  const userAddress = req.user.address;
  res.json({ message: `Hello ${userAddress}` });
});
```
