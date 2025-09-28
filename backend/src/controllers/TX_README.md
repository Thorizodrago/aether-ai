# Transaction API Documentation

## Overview
The transaction API provides endpoints for creating and broadcasting Algorand transactions, including payments and DEX swaps. All endpoints require JWT authentication via Bearer token.

## Authentication Required
All transaction endpoints require the `Authorization` header:
```
Authorization: Bearer <jwt-token>
```

Get the JWT token from the `/auth/verify-signed-tx` endpoint.

## Endpoints

### 1. Prepare Payment Transaction
**POST** `/tx/prepare-payment`

Creates an unsigned payment transaction that can be signed by the user's wallet.

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "to": "ALGORAND_RECIPIENT_ADDRESS",
  "amount": 1000000
}
```

**Response:**
```json
{
  "success": true,
  "unsignedB64": "base64-encoded-unsigned-transaction",
  "txnDetails": {
    "from": "SENDER_ADDRESS",
    "to": "RECIPIENT_ADDRESS",
    "amount": 1000000,
    "fee": 1000,
    "firstRound": 12345,
    "lastRound": 12355,
    "genesisHash": "..."
  }
}
```

**Error Responses:**
- `400` - Invalid recipient address or amount
- `401` - Invalid or missing JWT token
- `500` - Network error

### 2. Broadcast Signed Transaction
**POST** `/tx/broadcast`

Broadcasts a signed transaction to the Algorand network.

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

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
  "txId": "TRANSACTION_ID",
  "message": "Transaction broadcast successful"
}
```

**Error Responses:**
- `400` - Invalid signed transaction or network rejection
- `401` - Invalid or missing JWT token
- `403` - Transaction sender doesn't match authenticated user
- `500` - Broadcast failure

### 3. Prepare Swap Transaction
**POST** `/tx/prepare-swap`

Creates unsigned swap transactions for Tinyman DEX trading (currently placeholder).

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "fromAsset": 0,
  "toAsset": 31566704,
  "amount": 1000000
}
```

**Current Response (Placeholder):**
```json
{
  "success": false,
  "error": "Swap functionality not yet implemented",
  "message": "Tinyman integration coming soon",
  "requestedSwap": {
    "from": "USER_ADDRESS",
    "assetIn": 0,
    "assetOut": 31566704,
    "amountIn": 1000000
  }
}
```

## Usage Examples

### Complete Payment Flow

```javascript
// 1. Get JWT token (from auth flow)
const authToken = 'your-jwt-token';

// 2. Prepare payment transaction
const paymentResponse = await fetch('/tx/prepare-payment', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    to: 'RECIPIENT_ADDRESS',
    amount: 1000000 // 1 ALGO (in microAlgos)
  })
});
const { unsignedB64 } = await paymentResponse.json();

// 3. Sign transaction with user's wallet (AlgoSDK)
const unsignedTxn = algosdk.decodeUnsignedTransaction(
  Buffer.from(unsignedB64, 'base64')
);
const signedTxn = algosdk.signTransaction(unsignedTxn, secretKey);

// 4. Broadcast signed transaction
const broadcastResponse = await fetch('/tx/broadcast', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    signedTxnB64: Buffer.from(signedTxn.blob).toString('base64')
  })
});
const { txId } = await broadcastResponse.json();

console.log(`Payment successful! TX ID: ${txId}`);
```

## Security Features

### Transaction Validation
- **Sender Verification**: Only the authenticated user can broadcast transactions they signed
- **Address Validation**: All Algorand addresses are validated for correct format
- **Amount Validation**: Positive amounts required for payments and swaps

### JWT Protection
- All endpoints require valid JWT token
- Token must match the transaction sender
- Tokens expire after 24 hours

### Network Safety
- Transactions are validated by the Algorand network before broadcast
- Detailed error messages for network rejections
- Proper fee calculations using suggested parameters

## Asset ID Reference

Common Algorand assets:
- `0` or `"ALGO"` - Native ALGO
- `31566704` - USDC
- `312769` - Tether USDt
- `465865291` - GARD Stablecoin

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid parameters or transaction format |
| 401 | Unauthorized - Missing or invalid JWT token |
| 403 | Forbidden - Transaction sender mismatch |
| 500 | Internal Server Error - Network or server issues |

## Rate Limits

Currently no rate limits implemented, but recommended for production:
- 10 requests per minute per user for prepare endpoints
- 5 requests per minute per user for broadcast endpoint

## Future Enhancements

### Planned Features
- ✅ Payment transactions (implemented)
- ✅ Transaction broadcasting (implemented)
- 🔄 Tinyman DEX swaps (in progress)
- 📋 Asset opt-in transactions
- 📋 Multi-signature support
- 📋 Atomic transfers
- 📋 Smart contract interactions

### Tinyman Integration TODO
- Implement proper Tinyman SDK integration
- Add slippage protection
- Support for multi-hop swaps
- Pool liquidity checks
- Minimum received calculations
