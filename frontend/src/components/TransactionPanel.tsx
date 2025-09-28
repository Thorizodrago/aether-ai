/*
 * Transaction Panel Component
 * 
 * Interface for managing Algorand transactions and DeFi operations.
 * Integrated with Pera Wallet for transaction signing.
 */

import { useState } from 'react';
import api from '../services/api';

interface Transaction {
	id: string;
	type: 'send' | 'swap' | 'stake';
	status: 'pending' | 'confirmed' | 'failed';
	amount: number;
	asset: string;
	timestamp: Date;
	txId?: string;
}

interface TransactionPanelProps {
	walletAddress: string;
}

const TransactionPanel = ({ walletAddress }: TransactionPanelProps) => {
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [activeOperation, setActiveOperation] = useState<'send' | 'swap' | null>(null);

	// Send transaction form state
	const [sendForm, setSendForm] = useState({
		recipient: '',
		amount: '',
		asset: 'ALGO'
	});

	// Swap transaction form state
	const [swapForm, setSwapForm] = useState({
		fromAsset: 'ALGO',
		toAsset: 'USDC',
		amount: ''
	});

	const handleSendTransaction = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const response = await api.post('/tx/send', {
				from: walletAddress,
				to: sendForm.recipient,
				amount: parseFloat(sendForm.amount),
				asset: sendForm.asset
			});

			// Create pending transaction record
			const newTx: Transaction = {
				id: response.data.txId,
				type: 'send',
				status: 'pending',
				amount: parseFloat(sendForm.amount),
				asset: sendForm.asset,
				timestamp: new Date(),
				txId: response.data.txId
			};

			setTransactions(prev => [newTx, ...prev]);
			setSendForm({ recipient: '', amount: '', asset: 'ALGO' });
			setActiveOperation(null);

		} catch (error) {
			console.error('Send transaction failed:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSwapTransaction = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const response = await api.post('/tx/swap', {
				address: walletAddress,
				fromAsset: swapForm.fromAsset,
				toAsset: swapForm.toAsset,
				amount: parseFloat(swapForm.amount)
			});

			const newTx: Transaction = {
				id: response.data.txId,
				type: 'swap',
				status: 'pending',
				amount: parseFloat(swapForm.amount),
				asset: `${swapForm.fromAsset}→${swapForm.toAsset}`,
				timestamp: new Date(),
				txId: response.data.txId
			};

			setTransactions(prev => [newTx, ...prev]);
			setSwapForm({ fromAsset: 'ALGO', toAsset: 'USDC', amount: '' });
			setActiveOperation(null);

		} catch (error) {
			console.error('Swap transaction failed:', error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="transaction-panel">
			<div className="panel-header">
				<h2>Transaction Manager</h2>
				<div className="operation-buttons">
					<button
						onClick={() => setActiveOperation('send')}
						className={`operation-btn ${activeOperation === 'send' ? 'active' : ''}`}
					>
						Send
					</button>
					<button
						onClick={() => setActiveOperation('swap')}
						className={`operation-btn ${activeOperation === 'swap' ? 'active' : ''}`}
					>
						Swap
					</button>
				</div>
			</div>

			{activeOperation === 'send' && (
				<form onSubmit={handleSendTransaction} className="transaction-form">
					<h3>Send Transaction</h3>
					<input
						type="text"
						placeholder="Recipient Address"
						value={sendForm.recipient}
						onChange={(e) => setSendForm(prev => ({ ...prev, recipient: e.target.value }))}
						required
					/>
					<input
						type="number"
						placeholder="Amount"
						value={sendForm.amount}
						onChange={(e) => setSendForm(prev => ({ ...prev, amount: e.target.value }))}
						step="0.000001"
						min="0"
						required
					/>
					<select
						value={sendForm.asset}
						onChange={(e) => setSendForm(prev => ({ ...prev, asset: e.target.value }))}
					>
						<option value="ALGO">ALGO</option>
						<option value="USDC">USDC</option>
					</select>
					<button type="submit" disabled={isLoading}>
						{isLoading ? 'Sending...' : 'Send Transaction'}
					</button>
				</form>
			)}

			{activeOperation === 'swap' && (
				<form onSubmit={handleSwapTransaction} className="transaction-form">
					<h3>Swap Tokens</h3>
					<select
						value={swapForm.fromAsset}
						onChange={(e) => setSwapForm(prev => ({ ...prev, fromAsset: e.target.value }))}
					>
						<option value="ALGO">ALGO</option>
						<option value="USDC">USDC</option>
					</select>
					<input
						type="number"
						placeholder="Amount to swap"
						value={swapForm.amount}
						onChange={(e) => setSwapForm(prev => ({ ...prev, amount: e.target.value }))}
						step="0.000001"
						min="0"
						required
					/>
					<select
						value={swapForm.toAsset}
						onChange={(e) => setSwapForm(prev => ({ ...prev, toAsset: e.target.value }))}
					>
						<option value="USDC">USDC</option>
						<option value="ALGO">ALGO</option>
					</select>
					<button type="submit" disabled={isLoading}>
						{isLoading ? 'Swapping...' : 'Swap Tokens'}
					</button>
				</form>
			)}

			<div className="transaction-history">
				<h3>Recent Transactions</h3>
				{transactions.length === 0 ? (
					<p>No transactions yet</p>
				) : (
					<div className="transaction-list">
						{transactions.map(tx => (
							<div key={tx.id} className={`transaction-item ${tx.status}`}>
								<div className="tx-info">
									<span className="tx-type">{tx.type.toUpperCase()}</span>
									<span className="tx-amount">{tx.amount} {tx.asset}</span>
								</div>
								<div className="tx-details">
									<span className={`tx-status ${tx.status}`}>{tx.status}</span>
									<span className="tx-time">{tx.timestamp.toLocaleString()}</span>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default TransactionPanel;
