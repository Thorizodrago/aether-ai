import algosdk from 'algosdk';

const ALGOD_TOKEN = '';
const ALGOD_SERVER = 'https://testnet-api.algonode.cloud';
const ALGOD_PORT = '';

const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);

export interface ContractDeployment {
	appId: number;
	txId: string;
	sender: string;
	success: boolean;
	error?: string;
	unsignedTxn?: string; // Base64 encoded unsigned transaction
}

/**
 * Smart Contract Deployment Service for Pera Wallet
 */
export class SmartContractService {
	/**
	 * Deploy a smart contract using Pera Wallet
	 */
	static async deployContract(
		walletAddress: string,
		approvalProgram: string,
		clearProgram: string,
		globalInts: number = 4,
		globalBytes: number = 2,
		localInts: number = 2,
		localBytes: number = 1
	): Promise<ContractDeployment> {
		try {
			console.log('🚀 Deploying smart contract...');

			// Get suggested params
			const suggestedParams = await algodClient.getTransactionParams().do();

			// Compile programs (assuming they're already in TEAL format)
			const approvalCompileResp = await algodClient.compile(approvalProgram).do();
			const clearCompileResp = await algodClient.compile(clearProgram).do();

			const approvalBytes = new Uint8Array(Buffer.from(approvalCompileResp.result, 'base64'));
			const clearBytes = new Uint8Array(Buffer.from(clearCompileResp.result, 'base64'));

			// Create application creation transaction
			const createTxn = algosdk.makeApplicationCreateTxnFromObject({
				sender: walletAddress,
				suggestedParams,
				approvalProgram: approvalBytes,
				clearProgram: clearBytes,
				numGlobalInts: globalInts,
				numGlobalByteSlices: globalBytes,
				numLocalInts: localInts,
				numLocalByteSlices: localBytes,
				onComplete: algosdk.OnApplicationComplete.NoOpOC
			});

			// Return transaction for signing
			const txnB64 = Buffer.from(algosdk.encodeUnsignedTransaction(createTxn)).toString('base64');

			return {
				appId: 0, // Will be set after deployment
				txId: '',
				sender: walletAddress,
				success: false, // Will be updated after signing and sending
				unsignedTxn: txnB64
			};

		} catch (error) {
			console.error('Contract deployment error:', error);
			return {
				appId: 0,
				txId: '',
				sender: walletAddress,
				success: false,
				error: error instanceof Error ? error.message : 'Unknown deployment error'
			};
		}
	}

	/**
	 * Get simple TEAL programs for testing
	 */
	static getSendToWalletContract(): { approval: string; clear: string } {
		const approval = `
#pragma version 8

// Send to Wallet Smart Contract
// Simple approval program for testing

txn ApplicationID
int 0
==
bnz create_app

// Handle application calls
txn OnCompletion
int OptIn
==
bnz opt_in

txn OnCompletion
int NoOp
==
bnz main_logic

// Default reject
int 0
return

create_app:
    // Store admin as creator
    byte "admin"
    txn Sender
    app_global_put
    
    // Set default fee rate (0.25% = 25 basis points)
    byte "fee_rate"
    int 25
    app_global_put
    
    // Initialize transfer counter
    byte "total_transfers"
    int 0
    app_global_put
    
    int 1
    return

opt_in:
    // Initialize user transfer count
    byte "user_transfers"
    int 0
    app_local_put
    
    int 1
    return

main_logic:
    // Check if user opted in
    txn Sender
    txn ApplicationID
    app_opted_in
    assert
    
    // Increment user transfer count
    byte "user_transfers"
    byte "user_transfers"
    app_local_get
    int 1
    +
    app_local_put
    
    // Increment global transfer count
    byte "total_transfers"
    byte "total_transfers"
    app_global_get
    int 1
    +
    app_global_put
    
    int 1
    return
`;

		const clear = `
#pragma version 8
// Clear state program - always approve
int 1
return
`;

		return { approval, clear };
	}

	/**
	 * Interact with deployed contract
	 */
	static async callContract(
		walletAddress: string,
		appId: number,
		args: string[] = []
	): Promise<{ success: boolean; txId?: string; error?: string; unsignedTxn?: string }> {
		try {
			const suggestedParams = await algodClient.getTransactionParams().do();

			// Convert string arguments to Uint8Array
			const appArgs = args.map(arg => new Uint8Array(Buffer.from(arg, 'utf8')));

			const callTxn = algosdk.makeApplicationCallTxnFromObject({
				sender: walletAddress,
				appIndex: appId,
				onComplete: algosdk.OnApplicationComplete.NoOpOC,
				suggestedParams,
				appArgs
			});

			const txnB64 = Buffer.from(algosdk.encodeUnsignedTransaction(callTxn)).toString('base64');

			return {
				success: false, // Will be updated after signing
				unsignedTxn: txnB64
			};

		} catch (error) {
			console.error('Contract call error:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown call error'
			};
		}
	}
}

export default SmartContractService;
