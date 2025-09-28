/*
 * Dashboard Component
 * 
 * Main dashboard interface for wallet-connected users.
 * Displays wallet info and navigation options.
 */

import { useState } from 'react';
import SplashCursor from './SplashCursor';

interface DashboardProps {
	walletAddress: string;
	onDisconnect: () => void;
}

const Dashboard = ({ walletAddress, onDisconnect }: DashboardProps) => {
	const [activeTab, setActiveTab] = useState<'chat' | 'transactions'>('chat');

	return (
		<div className="dashboard">
			<SplashCursor />
			<header className="dashboard-header">
				<h1>Aether AI Dashboard</h1>
				<div className="wallet-info">
					<span>
						Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
					</span>
					<button onClick={onDisconnect} className="disconnect-btn">
						Disconnect
					</button>
				</div>
			</header>

			<nav className="dashboard-nav">
				<button
					className={`nav-btn ${activeTab === 'chat' ? 'active' : ''}`}
					onClick={() => setActiveTab('chat')}
				>
					AI Chat
				</button>
				<button
					className={`nav-btn ${activeTab === 'transactions' ? 'active' : ''}`}
					onClick={() => setActiveTab('transactions')}
				>
					Transactions
				</button>
			</nav>

			<main className="dashboard-content">
				{activeTab === 'chat' && (
					<div className="chat-section">
						<p>AI Chat interface will be implemented here</p>
					</div>
				)}

				{activeTab === 'transactions' && (
					<div className="transactions-section">
						<p>Transaction interface will be implemented here</p>
					</div>
				)}
			</main>
		</div>
	);
};

export default Dashboard;
