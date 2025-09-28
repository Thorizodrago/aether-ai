/*
 * Wallet Connection Component
 * 
 * Handles Pera Wallet connection state and provides wallet utilities.
 * Configured for TestNet development.
 */

import { useState, useEffect } from 'react';
import { PeraWalletConnect } from '@perawallet/connect';

interface WalletConnectionProps {
	onConnect?: (address: string) => void;
	onDisconnect?: () => void;
}

const peraWallet = new PeraWalletConnect({
	chainId: 416002 // TestNet chainId - 416002 is the correct type for TestNet
});

const WalletConnection = ({ onConnect, onDisconnect }: WalletConnectionProps) => {
	const [isConnected, setIsConnected] = useState(false);
	const [walletAddress, setWalletAddress] = useState<string | null>(null);

	useEffect(() => {
		// Check if wallet was previously connected
		const savedAddress = localStorage.getItem('walletAddress');
		if (savedAddress) {
			setWalletAddress(savedAddress);
			setIsConnected(true);
		}
	}, []);

	const connectWallet = async () => {
		try {
			const accounts = await peraWallet.connect();
			const address = accounts[0];

			setWalletAddress(address);
			setIsConnected(true);
			localStorage.setItem('walletAddress', address);

			onConnect?.(address);
		} catch (error) {
			console.error('Wallet connection failed:', error);
		}
	};

	const disconnectWallet = () => {
		peraWallet.disconnect();
		setWalletAddress(null);
		setIsConnected(false);
		localStorage.removeItem('walletAddress');

		onDisconnect?.();
	};

	return (
		<div className="wallet-connection">
			{isConnected ? (
				<div className="wallet-info">
					<span>Connected: {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}</span>
					<button onClick={disconnectWallet} className="disconnect-btn">
						Disconnect
					</button>
				</div>
			) : (
				<button onClick={connectWallet} className="connect-btn">
					Connect Pera Wallet
				</button>
			)}
		</div>
	);
};

export default WalletConnection;
