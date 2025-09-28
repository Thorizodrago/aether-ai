/*
 * Aether AI Connect Screen - Lite Connection
 * 
 * Simple Pera Wallet connection without backend authentication.
 * Perfect for quick wallet integration and TestNet development.
 */

import { useState } from 'react';
import { PeraWalletConnect } from '@perawallet/connect';
import './ConnectScreen.css';

interface ConnectScreenProps {
	onConnect: () => void;
}

// Initialize Pera Wallet with TestNet configuration (lite mode)
// See: https://docs.perawallet.app/references/pera-wallet-connect/
const peraWallet = new PeraWalletConnect({
	chainId: 416002 // TestNet chainId - simplified
});

const ConnectScreen = ({ onConnect }: ConnectScreenProps) => {
	const [isConnecting, setIsConnecting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleConnectWallet = async () => {
		setIsConnecting(true);
		setError(null);

		try {
			// Force disconnect any existing session before connecting
			try {
				await peraWallet.disconnect();
			} catch (disconnectError) {
				// Ignore disconnect errors, just continue
				console.log('Disconnect attempt (ignoring any errors):', disconnectError);
			}

			// Wait a bit for the disconnect to complete
			await new Promise(resolve => setTimeout(resolve, 100));

			console.log('🔗 Initiating Pera Wallet lite connection...');

			// Simple Pera Wallet connection - no backend auth needed
			const accounts = await peraWallet.connect();

			if (accounts.length === 0) {
				throw new Error('No accounts found');
			}

			const walletAddress = accounts[0];
			console.log('✅ Wallet connected successfully:', walletAddress);

			// Store wallet info and proceed directly
			localStorage.setItem('walletAddress', walletAddress);
			localStorage.setItem('isWalletConnected', 'true');

			// Proceed to main app immediately
			onConnect();

		} catch (error: any) {
			console.error('❌ Connection failed:', error);
			setError(error.message || 'Failed to connect wallet');
		} finally {
			setIsConnecting(false);
		}
	};

	return (
		<div className="connect-screen">
			<div className="gradient-blob blob-1"></div>
			<div className="gradient-blob blob-2"></div>
			<div className="gradient-blob blob-3"></div>

			<div className="connect-content">
				<div className="header-section">
					<img src="/src/assets/aether-logo.png" alt="Aether AI" className="main-logo" />
					<h1 className="main-title">Aether AI</h1>
				</div>

				<p className="subtitle">
					Powerful AI assistant specially trained for Web3
				</p>

				{error && (
					<div className="error-message">
						{error}
					</div>
				)}

				<button
					className="connect-button"
					onClick={handleConnectWallet}
					disabled={isConnecting}
				>
					{isConnecting ? 'Connecting to Pera Wallet...' : 'Connect Pera Wallet'}
				</button>

			</div>
		</div>
	);
};

export default ConnectScreen;
