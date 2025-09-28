# Tinyman Client Library Documentation

## Overview
The Tinyman client library provides helper functions for interacting with the Tinyman DEX on Algorand. It includes functionality for getting swap quotes, preparing swap transactions, and managing assets.

## Current Status
🚧 **Implementation Status**: Mock Implementation
- The library currently provides mock responses for testing and development
- Real Tinyman SDK integration is planned for production use
- All function signatures and response formats are production-ready

## Functions

### 1. getPoolQuote
Get a quote for a token swap without preparing transactions.

```typescript
const quote = await getPoolQuote(
  assetInId: number | string,
  assetOutId: number | string, 
  amount: number | string,
  swapType: 'fixed-input' | 'fixed-output' = 'fixed-input'
);
```

**Parameters:**
- `assetInId`: Input asset ID (0 or 'ALGO' for Algorand)
- `assetOutId`: Output asset ID (0 or 'ALGO' for Algorand)
- `amount`: Amount to swap in base units
- `swapType`: Type of swap (currently only 'fixed-input' supported)

**Response:**
```typescript
{
  success: boolean;
  pool?: {
    address: string;
    assetA: number;
    assetB: number;
    status: string;
  };
  quote?: {
    amountIn: string;
    amountOut: string;
    amountOutWithSlippage: string;
    swapFee: string;
    priceImpact: string;
  };
  swapType: string;
  notice?: string; // For mock responses
  error?: string;
}
```

### 2. prepareSwapTxns
Prepare unsigned transactions for a token swap.

```typescript
const result = await prepareSwapTxns(
  userAddress: string,
  assetInId: number | string,
  assetOutId: number | string,
  amount: number | string,
  slippage: number = 0.05
);
```

**Parameters:**
- `userAddress`: Address of the user performing the swap
- `assetInId`: Input asset ID
- `assetOutId`: Output asset ID  
- `amount`: Amount to swap in base units
- `slippage`: Slippage tolerance (0.05 = 5%)

**Response:**
```typescript
{
  success: boolean;
  transactions?: Array<{
    txn: string; // Base64 encoded transaction
    signers: string[]; // Addresses that need to sign
  }>;
  swapDetails?: {
    userAddress: string;
    assetIn: string;
    assetOut: string;
    amountIn: string;
    expectedAmountOut: string;
    minAmountOut: string;
    slippage: string;
    swapFee: string;
    priceImpact: string;
    poolAddress: string;
  };
  quote?: {
    amountOut: string;
    amountOutWithSlippage: string;
    swapFee: string;
    priceImpact: string;
  };
  notice?: string;
  error?: string;
}
```

### 3. getAssetInfo
Get detailed information about an Algorand asset.

```typescript
const assetInfo = await getAssetInfo(assetId: number | string);
```

**Response:**
```typescript
{
  success: boolean;
  asset?: {
    id: number;
    name: string;
    unitName: string;
    decimals: number;
    total: bigint;
    creator?: string;
    url?: string;
  };
  error?: string;
}
```

### 4. checkAssetOptIn
Check if a user is opted into a specific asset.

```typescript
const optInStatus = await checkAssetOptIn(
  userAddress: string, 
  assetId: number | string
);
```

**Response:**
```typescript
{
  success: boolean;
  isOptedIn?: boolean;
  userAddress?: string;
  assetId?: number;
  error?: string;
}
```

## API Endpoints

The transaction routes now include additional endpoints for Tinyman functionality:

### GET /tx/quote/:fromAsset/:toAsset/:amount
Get a swap quote without authentication (quotes are public).

**Example:**
```bash
GET /tx/quote/0/31566704/1000000
# Quote for swapping 1 ALGO to USDC
```

### GET /tx/asset/:assetId
Get asset information.

**Example:**
```bash
GET /tx/asset/31566704
# Get USDC asset information
```

### GET /tx/opt-in-status/:assetId
Check if the authenticated user is opted into an asset.

**Example:**
```bash
GET /tx/opt-in-status/31566704
# Check if user is opted into USDC
```

## Usage Examples

### Complete Swap Flow

```typescript
// 1. Get JWT token from authentication
const authToken = 'your-jwt-token';

// 2. Get a quote first (optional)
const quoteResponse = await fetch('/tx/quote/0/31566704/1000000');
const quote = await quoteResponse.json();
console.log('Expected output:', quote.quote?.amountOut);

// 3. Check if user needs to opt into the output asset
const optInResponse = await fetch('/tx/opt-in-status/31566704', {
  headers: { 'Authorization': `Bearer ${authToken}` }
});
const { isOptedIn } = await optInResponse.json();

if (!isOptedIn) {
  console.log('User needs to opt into USDC first');
  // Handle opt-in transaction (not implemented yet)
}

// 4. Prepare swap transactions
const swapResponse = await fetch('/tx/prepare-swap', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fromAsset: 0,      // ALGO
    toAsset: 31566704, // USDC
    amount: 1000000    // 1 ALGO
  })
});

const swapData = await swapResponse.json();

// 5. Sign transactions with wallet (client-side)
const signedTxns = [];
for (const unsignedTxn of swapData.unsignedB64) {
  const txn = algosdk.decodeUnsignedTransaction(Buffer.from(unsignedTxn, 'base64'));
  const signedTxn = algosdk.signTransaction(txn, secretKey);
  signedTxns.push(Buffer.from(signedTxn.blob).toString('base64'));
}

// 6. Broadcast each transaction
for (const signedTxn of signedTxns) {
  const broadcastResponse = await fetch('/tx/broadcast', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ signedTxnB64: signedTxn })
  });
  
  const result = await broadcastResponse.json();
  console.log('Transaction ID:', result.txId);
}
```

## Common Asset IDs

| Asset | ID | Decimals | Description |
|-------|-----|----------|-------------|
| ALGO | 0 | 6 | Native Algorand |
| USDC | 31566704 | 6 | USD Coin |
| USDt | 312769 | 6 | Tether USD |
| GARD | 465865291 | 6 | GARD Stablecoin |
| OPUL | 287867876 | 10 | Opulous |

## Error Handling

All functions return a consistent error format:
```typescript
{
  success: false,
  error: string,
  // Additional context fields
}
```

Common errors:
- "Invalid user address" - Address format validation failed
- "Pool not found or not ready" - Trading pair not available
- "Invalid amount" - Amount validation failed
- "Failed to get asset information" - Asset doesn't exist

## Future Enhancements

### Planned Features
- ✅ Mock swap preparation (current)
- 📋 Real Tinyman SDK integration
- 📋 Asset opt-in transaction preparation
- 📋 Pool liquidity information
- 📋 Multi-hop swap routing
- 📋 Historical price data
- 📋 Slippage optimization
- 📋 MEV protection

### SDK Integration TODO
1. Verify correct Tinyman SDK v2 import patterns
2. Implement proper pool fetching
3. Add real quote calculations
4. Handle transaction group signing
5. Add pool liquidity checks
6. Implement error handling for network failures
7. Add support for TestNet/MainNet switching

## Testing

The mock implementation allows for:
- API endpoint testing
- Frontend integration development  
- Transaction flow validation
- Error handling verification

Replace mock responses with real SDK calls when ready for production deployment.
